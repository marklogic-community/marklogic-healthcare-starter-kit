'use strict';

/** this is a non-persistent test that invokes a mapping step on a sample raw input record, and checks the result in memory.
    It uses an internal Data hub JavaScript API to apply the mapping step to the raw input.
 */
 
const flowApi = require("/data-hub/public/flow/flow-api.sjs");
const test = require("/test/test-helper.xqy");

const contentArray = [{
  "uri": "/claims/0a8c5c5f-46ff-28b5-3cba-309d1c4637fa.json",
  "value": {
	"envelope": {
		"headers": {
			"sources": [{
				"name": "ClaimIngest",
				"file": "data/synthea/csv/claims.csv"
			}, {
				"datahubSourceName": "/Users/credding/Documents/SLED/healthcare-starter-kit/data/synthea/csv/claims.csv",
				"datahubSourceType": "Claim"
			}],
			"createdUsingFile": "/var/folders/bc/4wdhh_js6q3cyrdldlvst8x5dhljp2/T/ingestion-7118838346587409139/claims.csv"
		},
		"triples": [],
		"instance": {
			"Id": "0a8c5c5f-46ff-28b5-3cba-309d1c4637fa",
			"PATIENTID": "d9fb22dd-45ab-41e3-7c6c-393d74805e67",
			"PROVIDERID": "91ded9ef-a836-32be-9449-bda240c260a9",
			"PRIMARYPATIENTINSURANCEID": "0",
			"SECONDARYPATIENTINSURANCEID": "0",
			"DEPARTMENTID": "5",
			"PATIENTDEPARTMENTID": "5",
			"DIAGNOSIS1": "702927004",
			"DIAGNOSIS2": "",
			"DIAGNOSIS3": "",
			"DIAGNOSIS4": "",
			"DIAGNOSIS5": "",
			"DIAGNOSIS6": "",
			"DIAGNOSIS7": "",
			"DIAGNOSIS8": "",
			"REFERRINGPROVIDERID": "",
			"APPOINTMENTID": "83d593b0-73e8-c18d-afad-f0414554a70a",
			"CURRENTILLNESSDATE": "2013-12-15T13:46:24Z",
			"SERVICEDATE": "2013-12-15T13:46:24Z",
			"SUPERVISINGPROVIDERID": "91ded9ef-a836-32be-9449-bda240c260a9",
			"STATUS1": "CLOSED",
			"STATUS2": "",
			"STATUSP": "CLOSED",
			"OUTSTANDING1": "0",
			"OUTSTANDING2": "",
			"OUTSTANDINGP": "0",
			"LASTBILLEDDATE1": "2013-12-15T14:01:24Z",
			"LASTBILLEDDATE2": "",
			"LASTBILLEDDATEP": "2013-12-15T14:01:24Z",
			"HEALTHCARECLAIMTYPEID1": "2",
			"HEALTHCARECLAIMTYPEID2": "0"
		},
		"attachments": null
	}
}
}];

const flowName = "Claim";
const runtimeOptions = {};
const result = flowApi.runFlowStepOnContent(flowName, "2", contentArray, runtimeOptions);

const assertions = [
  test.assertEqual("completed step 2", result.stepResponse.status),
  test.assertEqual(1, result.contentArray.length)
];

const content = result.contentArray[0];
const context = content.context;
const claim = content.value.toObject().envelope.instance.Claim;

assertions.push(
  test.assertEqual("0a8c5c5f-46ff-28b5-3cba-309d1c4637fa", claim.id),
  test.assertEqual("http://hl7.org/fhir/ValueSet/payeetype", claim.payee.Payee.type.CodeableConcept.coding[0].Coding.system),
  test.assertEqual("provider", claim.payee.Payee.type.CodeableConcept.coding[0].Coding.code),
  test.assertEqual("Provider", claim.payee.Payee.type.CodeableConcept.coding[0].Coding.display),
  test.assertEqual("702927004", claim.procedure[0].Procedure.procedureCodeableConcept.CodeableConcept.coding[0].Coding.code),
  test.assertEqual(2, claim.item.length),
  test.assertEqual("102.15", xs.string(claim.total.Money.value)),
  test.assertEqual("WELLSTAR URGENT CARE - DELK ROAD, 2890 DELK ROAD SOUTHEAST, MARIETTA, GA, 30067", claim.item[0].ClaimItem.locationAddress.Address.text),
  test.assertEqual("ClaimMapping", context.collections[0])
);

assertions