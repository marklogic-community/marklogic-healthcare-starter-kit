'use strict';

/** non-persistent test. See ClaimSuite/test.sjs for details **/

const flowApi = require("/data-hub/public/flow/flow-api.sjs");
const test = require("/test/test-helper.xqy");

const contentArray = [
  {
    "uri": "/patients/888f47a5-aa69-4bbd-9484-1b7946b3bfc1.json",
    "value": {
      "envelope": {
        "headers": {
          "sources": [
            {
              "name": "PatientIngest",
              "file": "data/synthea/csv/patients.csv"
            },
            {
              "datahubSourceName": "data/synthea/csv/patients.csv",
              "datahubSourceType": "Patient"
            }
          ],
          "createdOn": "2021-07-19T04:30:05.209923Z",
          "createdBy": "credding",
          "createdUsingFile": "/var/folders/bc/4wdhh_js6q3cyrdldlvst8x5dhljp2/T/ingestion-13822876790972002102/patients.csv"
        },
        "triples": [],
        "instance": {
          "Id": "47f8cf97-1142-2982-b523-7c5abef1b020",
          "BIRTHDATE": "1933-09-28",
          "DEATHDATE": "2018-01-11",
          "SSN": "999-87-3333",
          "DRIVERS": "S99935404",
          "PASSPORT": "X59222749X",
          "PREFIX": "Mrs.",
          "FIRST": "Kirby",
          "LAST": "Kutch",
          "SUFFIX": "PhD",
          "MAIDEN": "Lakin",
          "MARITAL": "M",
          "RACE": "white",
          "ETHNICITY": "nonhispanic",
          "GENDER": "F",
          "BIRTHPLACE": "Perry  Georgia  US",
          "ADDRESS": "496 Bayer Port",
          "CITY": "Dahlonega",
          "STATE": "Georgia",
          "COUNTY": "Lumpkin County",
          "ZIP": "30533",
          "LAT": "34.58109204798800",
          "LON": "-84.02127234765670",
          "HEALTHCARE_EXPENSES": "2943924.8175000000",
          "HEALTHCARE_COVERAGE": "452512.03250000000"
        },
        "attachments": null
      }
    }
  },
  {
    uri: '/patients/00000000-0000-0000-0000-000000000000.json',
    value: {
      envelope: {
        headers: {
          sources: [
            {
              name: 'PatientIngest',
              file: 'data/synthea/csv/patients.csv'
            },
            {
              datahubSourceName: 'data/synthea/csv/patients.csv',
              datahubSourceType: 'Patient'
            }
          ],
          createdOn: '2021-07-19T04:30:05.209923Z',
          createdBy: 'credding',
          createdUsingFile: '/var/folders/bc/4wdhh_js6q3cyrdldlvst8x5dhljp2/T/ingestion-13822876790972002102/patients.csv'
        },
        triples: [],
        instance: {
          Id: '9b80799a-531a-c571-3b2b-4ee8848414dd',
          BIRTHDATE: '1955-05-10',
          DEATHDATE: null,
          SSN: '111-11-1112',
          DRIVERS: 'S99935405',
          PASSPORT: 'X59222750X',
          PREFIX: 'Mr.',
          FIRST: 'Homer',
          LAST: 'Simpson',
          SUFFIX: '',
          MAIDEN: '',
          MARITAL: 'M',
          RACE: 'white',
          ETHNICITY: 'nonhispanic',
          GENDER: 'M',
          BIRTHPLACE: 'Springfield  Georgia  US',
          ADDRESS: '456 Line Dr.',
          CITY: 'Springfield',
          STATE: 'Georgia',
          COUNTY: 'Effingham County',
          ZIP: '31329',
          LAT: '32.371061',
          LON: '-81.3101812',
          HEALTHCARE_EXPENSES: '125.1250000000',
          HEALTHCARE_COVERAGE: '100.0000000000'
        },
        attachments: null
      }
    }
  }
];

const flowName = "Patient";
const runtimeOptions = {};
const result = flowApi.runFlowStepOnContent(flowName, "2", contentArray, runtimeOptions);

const assertions = [
  test.assertEqual("completed step 2", result.stepResponse.status),
  test.assertEqual(contentArray.length, result.contentArray.length)
];

const content = result.contentArray[0];
const context = content.context;
const patient = content.value.toObject().envelope.instance.Patient;

assertions.push(
  test.assertEqual("47f8cf97-1142-2982-b523-7c5abef1b020", patient.id),
  test.assertEqual("Kirby", patient.name[0].HumanName.given[0], "Given official name"),
  test.assertEqual("female", patient.gender, "Gender abbreviation should lookup and expand to human readable code value"),
  test.assertEqual("PatientMapping", context.collections[0]),
  test.assertTrue(context.permissions.some(perm => perm.roleId === xdmp.role('phi-reader') && perm.capability === 'read')),
);

assertions
