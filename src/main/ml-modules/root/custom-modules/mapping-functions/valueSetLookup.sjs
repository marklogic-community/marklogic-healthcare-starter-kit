'use strict';

/**
* This custom mapping function allows for looking up values and mapping them to FHIR ValueSet codes, display labels, and definitions.
* It leverages the FHIR ValueSet definition documents found in src/main/ml-data/referenceData/ValueSets/ which are derived directly from the FHIR specification.
* 
* Use in mapping steps where CodeableConcepts are arise.
* 
* @param value: the value being passed in as the lookup term; this will usually be a custom or unique code from the implementer's own data
* @param valueSet: the JSON document basename within the ValueSets/ directory, which is derived from the last token of the given document's corresponding FHIR ValueSet logical IRI
* 
* Returns: a JSON object node containing properties for the code, display, and definition (where applicable) matched from the supplied lookup value.
* 
* Throws: HSK-VALUESET-MISSING if no match occurred.
*/

function valueSetLookup(value, valueSet) {
    let nodes = [];
    let vsUriPath = "/referenceData/ValueSets/" + valueSet + ".json";
    let vsDoc = (fn.docAvailable(vsUriPath)) ? cts.doc(vsUriPath) : fn.error("HSK-VALUESET-MISSING", "The specified value set document " + valueSet + " was not found");
    let vsCode = vsDoc.root.toObject().valueSet.valueSetConcepts[value];
    let builder = new NodeBuilder();
    builder.addNode(vsCode);
    nodes.push(builder.toNode());
    return Sequence.from(nodes);
}

module.exports = {
  valueSetLookup
}