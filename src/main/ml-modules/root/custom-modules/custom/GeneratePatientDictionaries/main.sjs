const flowApi = require('/data-hub/public/flow/flow-api.sjs');
const spell = require("/MarkLogic/spell");

/**
 * A custom step implementation.
 *
 * In this case, we are not processing individual records, we are using the step to create two name dictionaries: one of all
 * given names in the raw data, and one of all family names.
 * Mstering uses these dictionaries for double metaphone matching rules.
 *
 * @param content either a single content object, or an array of content objects
 * @param options an object consisting of combined options from the runtime options, the step configuration, the flow options,
 *  and the step definition options
 * @returns a content object, or an array of content objects
 */
function main(content, options) {
  // make the first name dictionary
  makeDict('/(es:envelope|envelope)/(es:instance|instance)/Patient/name/HumanName/given', '/dictionary/first-names.xml');

  // make the last name dictionary
  makeDict('/(es:envelope|envelope)/(es:instance|instance)/Patient/name/HumanName/family', '/dictionary/last-names.xml');
}

function makeDict(index, uri) {

  // gets the values of the path index that is passed in
  const values = cts.values(cts.pathReference(
    index,
    ["collation=http://marklogic.com/collation/codepoint"],
    {"es": "http://marklogic.com/entity-services"}
  )).toArray();
  
  // make a spelling dictionary to be stored for double metaphone queries
  const dictionary = spell.makeDictionary(values, "element");
  
  console.log("Generating dictionary of " + values.length + " names at URI: " + uri);
  
  // write the dictionary to the FINAL database with the correct permissions
  xdmp.eval(
    "declareUpdate(); var d, uri; xdmp.documentInsert(uri, d, " +
    "[xdmp.permission('data-hub-common', 'read'), xdmp.permission('data-hub-common', 'update')], ['mdm-dictionary'])",
    {uri: uri, d: dictionary}
  );
}

module.exports = {
  main
};
