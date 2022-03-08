'use strict';

const op = require('/MarkLogic/optic');
const sem = require('/MarkLogic/semantics.xqy');

var search;
var start;
var limit;

const systemMap = new Map([
  ['http://hl7.org/fhir/sid/icd-10-cm', 'http://purl.bioontology.org/ontology/ICD10CM'],
  ['http://hl7.org/fhir/sid/icd-10-pcs', 'http://purl.bioontology.org/ontology/ICD10PCS'],
  ['http://snomed.info/sct', 'http://snomed.info/id']
]);
const systemAliasMap = new Map([
  ['http://hl7.org/fhir/sid/icd-10-cm', 'ICD10'],
  ['http://hl7.org/fhir/sid/icd-10-pcs', 'ICD10'],
  ['http://snomed.info/sct', 'SNOMED']
]);

const searchList = search ? JSON.parse(search) : [];

const resultParams = {};

/**
 * Gets the claims by heirarchical codes, e.g.: diagnosis code broader than <code>, etc.
 *
 * NOTE: This function is largely intended as a possible guide for how to implement searching by
 *       heirarchical codes, but has not been tested alongside other optic search parameters
 *
 * @param  {string}  field     The search field name
 * @param  {string}  modifier  The search field modifier
 * @param  {string}  value     The search field value
 * @param  {Object}  params    The optic query result parameter object
 *
 * @return {ModifyPlan}
 */
function getClaimsByHeirarchicalCodes(field, modifier, value, params) {
  const parts = value.split('/');
  const code = parts.pop();
  const system = parts.join('/');
  const systemAlias = systemAliasMap.get(system) || system;
  const broader = modifier === 'above'; // Other possible value is 'below'

  params.baseCode = sem.iri(`${systemMap.get(system) || system}/${code}`);

  const fragmentIdCol = op.fragmentIdCol('claim');

  const claims = op.fromView('Claims', `By${field === 'diagnosis' ? 'Diagnosis' : 'Procedure'}`, null, fragmentIdCol);

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

const param = searchList[0]; // TODO: Update when there is more than a single parameter

const searchField = param.field;
const searchModifier = param.modifier;
const searchValue = param.value;

// TODO: Update when there is more than a single parameter
getClaimsByHeirarchicalCodes(searchField, searchModifier, searchValue, resultParams)
  .offset(start)
  .limit(limit)
  .result(null, resultParams)
  .toArray();
