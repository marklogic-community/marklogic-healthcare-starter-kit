'use strict';

const test = require("/test/test-helper.xqy");

const tt = require("/lib/fhirTransforms/templateTransform.sjs")

const flowApi = require("/data-hub/public/flow/flow-api.sjs");

let contentArray = [{
	uri: "/provider/0a8c5c5f-46ff-28b5-3cba-309d1c4637fa.json",
	value: test.getTestFile("/provider1.json"),
}]

const flowName = "Provider";
const runtimeOptions = {};
const result = flowApi.runFlowStepOnContent(flowName, "3", contentArray, runtimeOptions);

const assertions = [
  test.assertEqual("completed step 3", result.stepResponse.status),
  test.assertEqual(1, result.contentArray.length)
];

const content = result.contentArray[0];
const context = content.context;
const doc = content.value.toObject();

assertions.push(
	test.assertTrue('custom__sanction' in doc.envelope.instance.Practitioner)
);

const config = {
	remove: ["envelope.instance.Practitioner.custom__sanction"]
}

var fhirPractitioner = tt.transform(config, doc)

assertions.push(
	test.assertFalse('custom__sanction' in fhirPractitioner)
);

assertions
