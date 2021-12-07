'use strict';

const op = require('/MarkLogic/optic');

const procedure = op.col('procedure');
// const icd10pcsCode = op.col('icd10pcs');

const rdfSchema = op.prefixer('http://www.w3.org/2000/01/rdf-schema#');
const icd10pcs = op.prefixer('http://purl.bioontology.org/ontology/ICD10PCS/');
// const skosCore = op.prefixer('http://www.w3.org/2004/02/skos/core#');

const getPathForCodeType = type => `/envelope/instance/Claim/${type}/${type[0].toUpperCase() + type.slice(1)}/${type}CodeableConcept/CodeableConcept/coding/Coding/code`;

const claims = op.fromSearchDocs(cts.collectionQuery(['Claim']));
const icd10pcsOntology = op.fromTriples([
  op.pattern(procedure, rdfSchema('subClassOf'), icd10pcs('3C1ZX8')),
  // op.pattern(procedure, skosCore('notation'), icd10pcsCode),
]);

icd10pcsOntology
  .joinInner(
    claims,
    op.on(
      procedure,
      op.as(
        'procedure',
        op.xpath('doc', getPathForCodeType('procedure'))
      ),
    )
  )
  .select([
    op.as('claim', op.xpath('doc', '/envelope/instance/Claim')),
    op.as('diagnosis', op.xpath('doc', getPathForCodeType('diagnosis'))),
    //icd10pcsCode,
  ])
  .where(
    op.eq(op.col('diagnosis'), '308335008')
  )
  .select(op.col('claim'))
  .result()
