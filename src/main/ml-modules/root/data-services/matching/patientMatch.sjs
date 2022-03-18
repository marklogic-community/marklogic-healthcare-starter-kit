'use strict';

const matchingUtils = require('/lib/adhocMatching/matchingUtils.sjs')

var ssn;
var firstName;
var lastName;
var dob;
var gender;

const matchingStep = 'MatchPatient-matching';

function buildPatientMatchTemplate(ssn, firstName, lastName, dob, gender) {
  var docTemplate = {
      "envelope": {
          "instance": {
              "Patient": {
                  "name": [{
                      "HumanName": {
                          "family": lastName,
                          "given": [
                              firstName
                          ]
                      }
                  }
                  ],
                  "birthDate": dob,
                  "gender": gender,
                  "identifier__ssn": ssn
              }
          }
      }
  }

  // build the template into a node
  const builder = new NodeBuilder();
  builder.startDocument();
  builder.addNode(docTemplate)
  builder.endDocument()

  return builder.toNode();
}

// build a document to use for matching
var matchTemplate = buildPatientMatchTemplate(ssn, firstName, lastName, dob, gender)

// run the matching step to get the match summary document
var matchSummary = matchingUtils.match(matchTemplate, matchingStep)

// extract the buckets and ids from match summary document
var result = matchingUtils.getIdsFromMatchURIs(matchingUtils.extractURIMatchesFromSummary(matchSummary), 'envelope/instance/Patient/id')

result