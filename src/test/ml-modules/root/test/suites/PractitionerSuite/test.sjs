'use strict';

/** non-persistent test. See ClaimSuite/test.sjs for details **/

const flowApi = require("/data-hub/public/flow/flow-api.sjs");
const test = require("/test/test-helper.xqy");

const contentArray = [{
  "uri": "/provider/00e083a5-70f9-3cad-8c4f-55d81694f780.json",
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
          "createdUsingFile": "/tmp/ingestion-2292104930376948370/providers.csv"
        },
        "triples": [],
        "instance": {
          "Id": "37c87df4-bd83-3244-ba93-982399145ce4",
          "ORGANIZATION": "6f08ab03-0f02-3afa-b00c-508ea49fab47",
          "NAME": "Andrea Kautzer",
          "GENDER": "F",
          "SPECIALITY": "GENERAL PRACTICE",
          "ADDRESS": "5041 DALLAS HWY BLD 1 C",
          "CITY": "POWDER SPRINGS",
          "STATE": "GA",
          "ZIP": "30127-6458",
          "LAT": "33.86435",
          "LON": "-84.681216",
          "UTILIZATION": "27",
          "NPI": "2956592114"
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
const practitioner = content.value.toObject().envelope.instance.Practitioner;

assertions.push(
  test.assertEqual("37c87df4-bd83-3244-ba93-982399145ce4", practitioner.id),
  test.assertEqual("Andrea", practitioner.name[0].HumanName.given[0], "Given official name"),
  test.assertEqual("female", practitioner.gender, "Gender abbreviation should lookup and expand to human readable code value"),
  test.assertEqual("PractitionerMapping", context.collections[0])
);

assertions
