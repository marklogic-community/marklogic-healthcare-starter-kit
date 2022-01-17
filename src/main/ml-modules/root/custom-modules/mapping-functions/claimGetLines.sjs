'use strict';

/**
* This custom mapping function takes a Claim Id as input, and fetches the claim's associated "claim lines" via cts.search for inclusion in the FHIR Claim entity modeling.  
* These are also known as claim "items" in FHIR parlance, or claim transactions based on the input sample project data.
* 
* @param claimId: the claim identifier of interest, to determine which claim's lines to retrieve.
* 
* Returns: A Sequence, built from an array of JSON Objects, with each object possessing a "claimLine" property detailing the claim transaction. 
* 
* Throws: not applicable.
* 
* Example usage: 
* claimGetLines("0002d470-664d-cf7c-3c66-cf3bcda1f2f6") 
* returns...
* [{"claimLine": {"ID": "ca9a22af-a924-7007-1d8f-884940455579", ...more details...}}]
*/

function claimGetLines(claimId) {
  let nodes = [];
  let search = cts.search(
    cts.andQuery([
        cts.jsonPropertyValueQuery("CLAIMID", claimId), 
        cts.collectionQuery("ClaimTransactionIngest")
    ])
  );
  for (var hit of search) {
    let builder = new NodeBuilder();
    let doc = hit.root.envelope.instance;
    builder.addNode({
      "claimLine": doc
    });
    nodes.push(builder.toNode());
  }
  return Sequence.from(nodes);
}

module.exports = {
    claimGetLines
}
