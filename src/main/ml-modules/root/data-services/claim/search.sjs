'use strict';

const op = require('/MarkLogic/optic');

// NOTE: This doesn't work with our current data, scrap all code below and replace with working generic search
// FUTURE: Integrate separate search capabilities from `searchByIcd10...` and `searchBySnomedCT...` files in this directory
const procedure = op.col('procedure');
const icd10pcsCode = op.col('icd10pcs');

const rdfSchema = op.prefixer('http://www.w3.org/2000/01/rdf-schema#');
const icd10pcs = op.prefixer('http://purl.bioontology.org/ontology/ICD10PCS/');
const skosCore = op.prefixer('http://www.w3.org/2004/02/skos/core#');

const getPathForCodeType = type => `/envelope/instance/Claim/${type}/${type[0].toUpperCase() + type.slice(1)}/${type}CodeableConcept/CodeableConcept/coding/Coding/code`;

const claims = op.fromSearchDocs(cts.collectionQuery(['Claim']));
// NOTE: op.fromTriples([...op.pattern(...)]) is far too limiting in the kinds of triple queries it allows for OR has
// extremely poorly documented capabilities for full graph searches
const icd10pcsOntology = op.fromTriples([
  op.pattern(procedure, rdfSchema('subClassOf'), icd10pcs('3C1ZX8')),
  op.pattern(procedure, skosCore('notation'), icd10pcsCode),
]);

icd10pcsOntology
  // NOTE: Documentation is unclear as to which join functions are equivalent to SQL "OUTER JOIN", "LEFT OUTER JOIN",
  // "RIGHT OUTER JOIN", etc.
  .joinInner(
    claims,
    op.on(
      icd10pcsCode,
      op.as(
        'procedure',
        // NOTE: This gains minimal performance (if any) over cts.jsonPropertyScopeQuery(propName, query) and is less
        // intuitive
        op.xpath('doc', getPathForCodeType('procedure'))
      ),
    )
  )
  .select([
    op.as('claim', op.xpath('doc', '/envelope/instance/Claim')),
    op.as('diagnosis', op.xpath('doc', getPathForCodeType('diagnosis'))),
  ])
  .where(
    op.eq(op.col('diagnosis'), '308335008')
  )
  .select(op.col('claim'))
  .result()
