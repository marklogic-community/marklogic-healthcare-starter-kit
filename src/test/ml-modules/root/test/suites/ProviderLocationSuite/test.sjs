'use strict';

/** non-persistent test. See ClaimSuite/test.sjs for details **/

const flowApi = require("/data-hub/public/flow/flow-api.sjs");
const test = require("/test/test-helper.xqy");

const contentArray = [{
  "uri": "/provider/9d4ea135-3756-33ca-aa83-4dc6ee1c3c19.json",
  "value": {
  "envelope": {
    "headers": {
      "sources": [
        {
          "name": "ProviderIngest",
          "file": "data/synthea/csv/providers.csv"
        },
        {
          "datahubSourceName": "data/synthea/csv/providers.csv",
          "datahubSourceType": "Provider"
        }
      ],
      "createdUsingFile": "/tmp/ingestion-2366799265966070291/providers.csv"
    },
    "triples": [],
    "instance": {
      "Id": "9d4ea135-3756-33ca-aa83-4dc6ee1c3c19",
      "ORGANIZATION": "4ac4202b-97ee-3dff-8c35-dccd330c98e2",
      "NAME": "Ester Guzmán",
      "GENDER": "F",
      "SPECIALITY": "GENERAL PRACTICE",
      "ADDRESS": "1904 PALMYRA RD",
      "CITY": "ALBANY",
      "STATE": "GA",
      "ZIP": "31701-1575",
      "LAT": "31.577669",
      "LON": "-84.17945300000000",
      "UTILIZATION": "28",
      "NPI": "5648965958"
    },
    "attachments": null
  }
}
}];

const flowName = "Provider";
const runtimeOptions = {};
const result = flowApi.runFlowStepOnContent(flowName, "4", contentArray, runtimeOptions);

const assertions = [
  test.assertEqual("completed step 4", result.stepResponse.status),
  test.assertEqual(1, result.contentArray.length)
];

const content = result.contentArray[0];
const context = content.context;
const location = content.value.toObject().envelope.instance.Location;

assertions.push(
  test.assertEqual("9d4ea135-3756-33ca-aa83-4dc6ee1c3c19", location.id),
  test.assertEqual("1904 PALMYRA RD", location.address[0].Address.line[0], "Street Address"),
  test.assertEqual(31.577669, location.position.Position.latitude, "Latitude"),
  test.assertEqual("ProviderLocation", context.collections[0])
);

assertions
