'use strict';

/**
* Note: as a JavaScript mapping function, this will incur significant overhead at runtime. XPath/XSLT functions run much faster. 
* 
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

function valueSetLookup(value, valueSet, ifValueIsEmpty) {
  const vsDoc = cts.doc(`/referenceData/ValueSets/${valueSet}.json`);

  if (!vsDoc) {
    fn.error('HSK-VALUESET-MISSING', `The specified value set document ${valueSet} was not found`);
  }

  const vsConcepts = vsDoc.root.valueSet.valueSetConcepts;
  const vsCode = value ? vsConcepts[value] : vsConcepts[ifValueIsEmpty || 'UNKNOWN'];

  return Sequence.from([new NodeBuilder().addNode(vsCode).toNode()]);
}

module.exports = {
  valueSetLookup
}
