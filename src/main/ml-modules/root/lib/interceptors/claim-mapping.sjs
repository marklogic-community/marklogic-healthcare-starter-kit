"use strict";

const { getTraceHelpers } = require('/lib/util/trace-helpers.sjs');

declareUpdate();

const { trace, traceObject } = getTraceHelpers('claim-mapping');

const employeesAndRelatives = Array.from(cts.doc('/meta/employeesAndRelatives.json').root.ids).map(id => id.toString());
const psychDiagnoses = Array.from(cts.doc('/meta/psych-diagnoses.json').root.codes.snomed).map(code => code.toString());

traceObject(employeesAndRelatives);
traceObject(psychDiagnoses);

const employeePsychReader = xdmp.permission('employee-psych-reader', 'read');
const employeeReader = xdmp.permission('employee-reader', 'read');
const psychReader = xdmp.permission('psych-reader', 'read');
const phiReader = xdmp.permission('phi-reader', 'read');

function isPsychClaim(claim) {
  return psychDiagnoses.includes(claim.envelope.instance.Claim.diagnosis[0].Diagnosis.code__diagnosisCodeableConcept_SNOMED.toString());
}

function isClaimForEmployeeOrRelative(claim) {
  return employeesAndRelatives.includes(claim.envelope.instance.Claim.patient.Reference.reference.toString().replace('Patient/', ''));
}

var contentArray;
var options;

traceObject(contentArray);
traceObject(options);

contentArray.forEach(content => {
  const claim = content.value.root || content.value;
  const isPsych = isPsychClaim(claim);

  /**
   * This interceptor checks to see if the claim patient's ID matches that of an employee/relative of an employee, and
   * if the claim's diagnosis is a psychological one, and changes the read permissions on the data appropriately
   */
  if (isClaimForEmployeeOrRelative(claim)) {
    content.context.permissions.push(
      isPsych
        ? employeePsychReader
        : employeeReader
    );
  } else {
    content.context.permissions.push(
      isPsych
        ? psychReader
        : phiReader
    );
  }
});
