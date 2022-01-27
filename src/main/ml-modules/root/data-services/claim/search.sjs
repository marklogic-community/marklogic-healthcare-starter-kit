'use strict';

const op = require('/MarkLogic/optic');
const sem = require('/MarkLogic/semantics.xqy');

var search;
var start;
var limit;

const systemMap = new Map([
  ['http://hl7.org/fhir/sid/icd-10-cm', 'http://purl.bioontology.org/ontology/ICD10CM/'],
  ['http://hl7.org/fhir/sid/icd-10-pcs', 'http://purl.bioontology.org/ontology/ICD10PCS/'],
  ['http://snomed.info/sct/', 'http://snomed.info/id/']
]);
const systemAliasMap = new Map([
  ['http://hl7.org/fhir/sid/icd-10-cm', 'ICD10'],
  ['http://hl7.org/fhir/sid/icd-10-pcs', 'ICD10'],
  ['http://snomed.info/sct/', 'SNOMED']
]);

const searchList = search ? JSON.parse(search) : [];

const broader = false;

const fragmentIdCol = op.fragmentIdCol('fragment');

const claimsByDiagnosis = op.fromView('Claim', 'Reference_Projection_By_Diagnosis', null, fragmentIdCol);
// const claimsByProcedure = op.fromView('Claim', 'Reference_Projection_By_Procedure', null, fragmentIdCol);

const resultParams = {};

/**
 * Gets the claims by heirarchical codes, e.g.: diagnosis code broader than <code>, etc.
 *
 * NOTE: This function is largely intended as a possible guide for how to implement searching by
 *       heirarchical codes, but has not been tested alongside other optic search parameters
 *
 * @param  {string}  field     The search field name
 * @param  {<type>}  modifier  The search field modifier
 * @param  {<type>}  value     The search field value
 * @param  {<type>}  params    The optic query result parameters
 *
 * @return {<type>}  The claims by heirarchical codes.
 */
function getClaimsByHeirarchicalCodes(field, modifier, value, params) {
  const parts = value.split('/');
  const code = parts.pop();
  const system = parts.join('/');
  const systemAlias = systemAliasMap.get(system) || system;

  params.baseCode = sem.iri(`${systemMap.get(system) || system}/${code}`);

  const fragmentIdCol = op.fragmentIdCol('claim');

  const claims = op.fromView('Claim', `Reference_Projection_By_${field === 'diagnosis' ? 'Diagnosis' : 'Procedure'}`, null, fragmentIdCol);

  return op
    .fromSPARQL(`
      select ?code where {
        ?iri ${broader ? '^' : ''}<http://www.w3.org/2000/01/rdf-schema#subClassOf>* @baseCode ;
                                  <http://www.w3.org/2004/02/skos/core#notation>     ?code
      }
    `)
    .joinInner(claims, op.on(op.col('code'), op.col(`${field}__${systemAlias}`)))
    .select(fragmentIdCol)
    .whereDistinct()
    .joinDoc(op.col('doc'), fragmentIdCol);
}

op
  .fromSPARQL(`
    select ?code where {
      ?iri ${broader ? '^' : ''}<http://www.w3.org/2000/01/rdf-schema#subClassOf>* @baseCode ;
                                <http://www.w3.org/2004/02/skos/core#notation>     ?code
    }
  `)
  .joinInner(claimsByDiagnosis, op.on(op.col('code'), op.col('diagnosis__SNOMED')))
  .select(fragmentIdCol)
  .whereDistinct()
  .offset(start)
  .limit(limit)
  .joinDoc(op.col('doc'), fragmentIdCol)
  .result(null, resultParams)
