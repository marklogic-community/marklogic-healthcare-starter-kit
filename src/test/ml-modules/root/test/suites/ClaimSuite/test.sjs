'use strict';

/** this is a non-persistent test that invokes a mapping step on a sample raw input record, and checks the result in memory.
    It uses an internal Data hub JavaScript API to apply the mapping step to the raw input.
 */
 
const flowApi = require("/data-hub/public/flow/flow-api.sjs");
const test = require("/test/test-helper.xqy");

let contentArray = [{
	uri: "/claims/0a8c5c5f-46ff-28b5-3cba-309d1c4637fa.json",
	value:cts.doc("/claim1.json").toObject(),
}]

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

// xdmp.log(xdmp.quote(claim)) 

assertions.push(
  test.assertEqual("99999999-TEST-9999-9999-SUITE-MLUNIT", claim.id),
  test.assertEqual("provider", claim.payee.Payee.code__type),
  test.assertEqual("185349003", claim.procedure[0].Procedure.code__procedureCodeableConcept__SNOMED),
  test.assertEqual(2, claim.item.length),
  test.assertEqual(83, claim.total.Money.value),
  test.assertEqual("SOUTHEAST GEORGIA HEALTH SYSTEM- BRUNSWICK CAMPUS, 2415 PARKWOOD DRIVE, BRUNSWICK, GA, 31520", claim.item[0].ClaimItem.locationAddress.Address.text),
  test.assertEqual("ClaimMapping", context.collections[0])
);

assertions