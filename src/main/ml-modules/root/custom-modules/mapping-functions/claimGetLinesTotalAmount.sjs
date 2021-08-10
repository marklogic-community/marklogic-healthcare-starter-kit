'use strict';

/**
* This custom mapping function takes a Claim Id as input, and fetches the claim's associated "claim lines" via cts.search for inclusion in the FHIR Claim entity modeling.  
* These are also known as claim "items" in FHIR parlance, or claim transactions based on the input sample project data.
* It then looks in each claim transaction/line item, grabs the AMOUNT cost for that item.  Finally, across all line items, a sum is generated via the built-in fn.sum() function. 
* For even faster performance, consider placing an element range index on AMOUNT using a xs:decimal scalar type, and sum via cts.sumAggregate(). 
* 
* @param claim: the claim identifier of interest, to determine which claim's lines to retrieve.
* 
* Returns: A Sequence, built from a singular JSON Object possessing a "claimAmountTotal" property detailing the sum of amounts across all claim transactions. 
* 
* Throws: not applicable.
* 
* Example usage: 
* claimGetLinesTotalAmount("a7130de1-e4c1-274e-475f-4da35bac6c78")
* returns...
* {"claimAmountTotal": 61.29}
*/

function claimGetLinesTotalAmount(claim) {
  const reducer = (accumulator, currentValue) => accumulator + currentValue;
  let amounts = [];
  let nodes = [];
  let search = cts.search(
    cts.andQuery([
        cts.jsonPropertyValueQuery("CLAIMID", claim), 
        cts.collectionQuery("ClaimTransactionIngest")
    ])
  );
  for (var hit of search) {
    let amt = hit.root.envelope.instance.AMOUNT;
    if (fn.stringLength(amt) > 0 && xs.decimal(amt)) {
      amounts.push(amt);
    }
  }
  let builder = new NodeBuilder();
  builder.addNode({
    "claimAmountTotal": fn.sum(amounts)
  });
  nodes.push(builder.toNode());
  return Sequence.from(nodes);
}

module.exports = {
    claimGetLinesTotalAmount
}
