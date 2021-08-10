'use strict';

const flowApi = require("/data-hub/public/flow/flow-api.sjs");
const test = require("/test/test-helper.xqy");

const contentArray = [{
  "uri": "/organization/3ff2e4da-531e-3439-9532-fb9de7f124f4.json",
  "value": {
    "envelope":{"headers":{"sources":[{"name":"OrganizationIngest", "file":"data/synthea/csv/organizations.csv"}, {"datahubSourceName":"data/synthea/csv/organizations/organizations.csv", "datahubSourceType":"Organization"}], "createdUsingFile":"/Users/credding/Documents/SLED/healthcare-starter-kit/data/synthea/csv/organizations/organizations.csv"}, "triples":[], "instance":{"Id":"3ff2e4da-531e-3439-9532-fb9de7f124f4", "NAME":"SUMMIT URGENT CARE AND OCCUPATIONAL MEDICINE", "ADDRESS":"1755 EAST STATE HIGHWAY 34", "CITY":"NEWNAN", "STATE":"GA", "ZIP":"30265", "LAT":"33.4008555", "LON":"-84.7213181", "PHONE":"770-502-2121", "REVENUE":"0.0", "UTILIZATION":"16"}, "attachments":null}
  }
}];

const flowName = "Organization";
const runtimeOptions = {};
const result = flowApi.runFlowStepOnContent(flowName, "2", contentArray, runtimeOptions);

const assertions = [
  test.assertEqual("completed step 2", result.stepResponse.status),
  test.assertEqual(1, result.contentArray.length)
];

const content = result.contentArray[0];
const context = content.context;
const org = content.value.toObject().envelope.instance.Organization;

assertions.push(
  test.assertEqual("3ff2e4da-531e-3439-9532-fb9de7f124f4", org.id),
  test.assertEqual("SUMMIT URGENT CARE AND OCCUPATIONAL MEDICINE", org.name, "Given official name"),
  test.assertEqual("prov", org.code__type, "Organization type should lookup and expand to code value"),
  //test.assertEqual("Healthcare Provider", org.type.CodeableConcept.coding[0].Coding.display, "Organization type should lookup and expand to human readable code value"),
  test.assertEqual("OrganizationMapping", context.collections[0])
);

assertions