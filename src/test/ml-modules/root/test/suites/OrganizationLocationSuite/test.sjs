'use strict';

/** non-persistent test. See ClaimSuite/test.sjs for details **/

const flowApi = require("/data-hub/public/flow/flow-api.sjs");
const test = require("/test/test-helper.xqy");

const contentArray = [{
  "uri": "/organization/location/361676f0-d3e4-3dfb-afbf-bb2292c256e2.json",
  "value": {
  "envelope": {
    "headers": {
      "sources": [
        {
          "name": "OrganizationIngest",
          "file": "data/synthea/csv/organizations.csv"
        },
        {
          "datahubSourceName": "data/synthea/csv/organizations.csv",
          "datahubSourceType": "Organization"
        }
      ],
      "createdUsingFile": "/tmp/ingestion-294649096510750557/organizations.csv"
    },
    "triples": [],
    "instance": {
      "Id": "361676f0-d3e4-3dfb-afbf-bb2292c256e2",
      "NAME": "GWINNETT PHYSICIAN GROUP LLC",
      "ADDRESS": "3620 HOWELL FERRY RD",
      "CITY": "DULUTH",
      "STATE": "GA",
      "ZIP": "30096-3178",
      "LAT": "34.001517",
      "LON": "-84.150473",
      "PHONE": "678-312-3294",
      "REVENUE": "0.0",
      "UTILIZATION": "19"
    },
    "attachments": null
  }
}
}];

const flowName = "Organization";
const runtimeOptions = {};
const result = flowApi.runFlowStepOnContent(flowName, "3", contentArray, runtimeOptions);

const assertions = [
  test.assertEqual("completed step 3", result.stepResponse.status),
  test.assertEqual(1, result.contentArray.length)
];

const content = result.contentArray[0];
const context = content.context;
const location = content.value.toObject().envelope.instance.Location;

assertions.push(
  test.assertEqual("361676f0-d3e4-3dfb-afbf-bb2292c256e2", location.id),
  test.assertEqual("3620 HOWELL FERRY RD", location.address[0].Address.line[0], "Street Address"),
  test.assertEqual(-84.150473, location.position.Position.longitude, "Longitude"),
  test.assertEqual("OrganizationLocationMapping", context.collections[0])
);

assertions
