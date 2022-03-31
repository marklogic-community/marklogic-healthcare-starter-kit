'use strict';
const { getTraceHelpers } = require('/lib/util/trace-helpers.sjs');

var contentArray;
var options;

var entireRecord;
var entries;

const { trace, traceObject } = getTraceHelpers('flat-to-multiple');

traceObject(contentArray);
traceObject(options);
traceObject(entries);

// Add default values to variables
entireRecord = entireRecord || false;

function flatToMultipleEntries(nodes, breakouts) {
	return nodes.reduce(
    (nodesAcc, node) => nodesAcc.concat(breakouts.reduce(
      (acc, breakout) => acc.concat(node.xpath(breakout.xpath).toArray().map(source => ({ type: breakout.type, source }))),
      [],
    )),
    [],
  );
}

/**
 * Wraps `flatToMultipleEntries` in a way where DHF users can provide multiple specs for unflattening fields in a single
 * call to this pre-step interceptor.
 */
contentArray.forEach(content => {
  const doc = content.value;
  const envelope = (doc.root || doc.toObject()).envelope;
  const instance = envelope.instance;

  const record = entireRecord ? doc : fn.head(doc.xpath('envelope/instance'));
  const results = {};

  for (const { dest, sourcedFrom, breakouts } of entries) {
  	results[dest] = flatToMultipleEntries(sourcedFrom ? record.xpath(sourcedFrom).toArray() : [record], breakouts);
  }

  const newInstance = {
  	...instance,
  	...results,
  };

  content.value = new NodeBuilder().addNode(entireRecord ? { envelope: { ...envelope, instance: newInstance } } : newInstance).toNode();
});
