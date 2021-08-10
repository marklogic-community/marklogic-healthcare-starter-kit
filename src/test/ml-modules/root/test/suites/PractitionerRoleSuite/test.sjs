'use strict';

const flowApi = require("/data-hub/public/flow/flow-api.sjs");
const test = require("/test/test-helper.xqy");

const contentArray = [{
  "uri": "/provider/50e1b18e-f201-3669-8b49-5606a9b5b776.json",
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
        "createdUsingFile": "C:\\Users\\bgriffin\\AppData\\Local\\Temp\\ingestion-14839826353040065657\\providers.csv"
      },
      "triples": [],
      "instance": {
        "Id": "50e1b18e-f201-3669-8b49-5606a9b5b776",
        "ORGANIZATION": "ac762f62-d91b-369d-946b-017bcae4132c",
        "NAME": "Dominica Klein",
        "GENDER": "F",
        "SPECIALITY": "GENERAL PRACTICE",
        "ADDRESS": "936 S 1ST ST",
        "CITY": "JESUP",
        "STATE": "GA",
        "ZIP": "31545-0332",
        "LAT": "31.494049",
        "LON": "-81.810864",
        "UTILIZATION": "88",
        "NPI": "3042003736"
      },
      "attachments": null
    }
  }
}];

const flowName = "Provider";
const runtimeOptions = {};
const result = flowApi.runFlowStepOnContent(flowName, "3", contentArray, runtimeOptions);

const assertions = [
  test.assertEqual("completed step 3", result.stepResponse.status),
  test.assertEqual(1, result.contentArray.length)
];

const content = result.contentArray[0];
const context = content.context;
const providerRole = content.value.toObject().envelope.instance.PractitionerRole;

assertions.push(
  test.assertEqual("50e1b18e-f201-3669-8b49-5606a9b5b776", providerRole.id),
  test.assertEqual("Organization/ac762f62-d91b-369d-946b-017bcae4132c", providerRole.organization.Reference.reference, "organization reference"),
  test.assertEqual("doctor", providerRole.code__code, "General Practice -> doctor")
);

assertions