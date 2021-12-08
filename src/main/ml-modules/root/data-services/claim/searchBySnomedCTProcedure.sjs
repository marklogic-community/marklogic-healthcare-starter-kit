'use strict';

const op = require('/MarkLogic/optic');

var search; // TODO: (in all search files) expand search parameter beyond simple string value
var start;
var limit;

const procedureCodes = [
  ...op
    // TODO: We can't develop for actual SNOMED CT Ontology because we don't have a license to use/distribute it
    .fromSPARQL(`
      select ?code where {
        ?code <owl:broader>* <${search}> .
      }
    `)
    .map(code => code.code) // Flatten from [{ code: '123456' }, ...] -> ['123456', ...]
    .result()
];

const results = cts.search(
  cts.andQuery([
    cts.collectionQuery(['Claim']),
    cts.jsonPropertyScopeQuery('procedureCodeableConcept', cts.jsonPropertyValueQuery('code', procedureCodes)),
  ])
);

fn.subsequence(results, start, limit);
