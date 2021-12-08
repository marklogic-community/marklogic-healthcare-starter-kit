'use strict';

const op = require('/MarkLogic/optic');

var search; // TODO: (in all search files) expand search parameter beyond simple string value
var start;
var limit;

const procedureCodes = [
  ...op
    .fromSPARQL(`
      prefix rdfSchema: <http://www.w3.org/2000/01/rdf-schema#>
      prefix icd10cm:   <http://purl.bioontology.org/ontology/ICD10CM/>
      prefix skosCore:  <http://www.w3.org/2004/02/skos/core#>

      select ?code where {
        ?procedure rdfSchema:subClassOf* icd10cm:${search} ;
                    skosCore:notation    ?code
      }
    `)
    .map(code => code.code) // Flatten from [{ code: '123456' }, ...] -> ['123456', ...]
    .result()
];

const results = cts.search(
  cts.andQuery([
    cts.collectionQuery(['Claim']),
    cts.jsonPropertyScopeQuery('diagnosisCodeableConcept', cts.jsonPropertyValueQuery('code', procedureCodes)),
  ])
);

fn.subsequence(results, start, limit);
