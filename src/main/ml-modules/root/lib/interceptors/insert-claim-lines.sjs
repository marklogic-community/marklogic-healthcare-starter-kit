'use strict';
const { getTraceHelpers } = require('/lib/util/trace-helpers.sjs');

var contentArray;
var options;

var claimIdPath;
var placeOfServiceIdPath;
var linesDestination;
var linesTotalAmountDestination;

const { trace, traceObject } = getTraceHelpers('insert-claim-lines');

traceObject(contentArray);
traceObject(options);

function claimGetOrganizationLocation(placeOfServiceId) {
  // Performance note: we use a path index to avoid building a larger index with every Id in the system. But a simple jsonPropertyRangeQuery on an Id will also work
  // It is NOT a best practice to use jsonPropertyValueQuery for Id values in a batch; that accesses many different index structures
  // By using a range index, a single range index structure is memory mapped and available without excessive I/O
  const search = cts.search(
    cts.andQuery([
      cts.jsonPropertyValueQuery("Id", placeOfServiceId),
      cts.collectionQuery("OrganizationIngest")
    ])
  );

  return search.toArray().map(hit => hit.root.envelope.instance);
}

function claimGetLines(claimId) {
  const lines = [];
  const amounts = [];

  const search = cts.search(
    cts.andQuery([
      cts.jsonPropertyValueQuery("CLAIMID", claimId),
      cts.collectionQuery("ClaimTransactionIngest")
    ])
  );

  for (const hit of search) {
    const claimLine = {
      ...hit.root.envelope.instance,

      locations: claimGetOrganizationLocation(hit.xpath(['envelope/instance', placeOfServiceIdPath].join('/')).toArray()[0])
    };

    lines.push(claimLine);

    const amt = claimLine.AMOUNT;
    if (fn.stringLength(amt) > 0 && xs.decimal(amt)) {
      amounts.push(amt);
    }
  }

  return {
    [linesDestination]: lines,
    [linesTotalAmountDestination]: fn.sum(amounts),
  };
}

/**
 * Since a mapping step discards all data not explicitly mapped we need to restore the original
 * document instance into the result, overwriting with mapped values as necessary
 */
contentArray.forEach(content => {
  const doc = content.value;

  const claimId = doc.xpath(['envelope/instance', claimIdPath].join('/')).toArray()[0];

  const result = {
    ...doc.root.envelope.instance,

    ...claimGetLines(claimId),
  };

  content.value = new NodeBuilder().addNode(result).toNode();
});
