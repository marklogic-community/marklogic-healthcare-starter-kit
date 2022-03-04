'use strict';

/** this is a non-persistent test that invokes a mapping step on a sample raw input record, and checks the result in memory.
    It uses an internal Data hub JavaScript API to apply the mapping step to the raw input.
 */
 
const flowApi = require("/data-hub/public/flow/flow-api.sjs");
const test = require("/test/test-helper.xqy");

let contentArray = [{
	uri: "/provider/0a8c5c5f-46ff-28b5-3cba-309d1c4637fa.json",
	value: test.getTestFile("/provider1.json"),
}]

const flowName = "Provider";
const runtimeOptions = {};
const result = flowApi.runFlowStepOnContent(flowName, "2", contentArray, runtimeOptions);

const assertions = [
  test.assertEqual("completed step 2", result.stepResponse.status),
  test.assertEqual(1, result.contentArray.length)
];

const content = result.contentArray[0];
const context = content.context;
const practitioner = content.value.toObject().envelope.instance.Practitioner;

assertions.push([
  test.assertTrue('custom__sanction' in practitioner)
])

assertions
