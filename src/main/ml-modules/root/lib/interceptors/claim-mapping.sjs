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

/** Check to see if any of the SNOMED diagnosis codes on the claim are psychological in nature */
function isPsychClaim(claim) {
  return claim.envelope.instance.Claim.diagnosis.some(
    diagnosis => psychDiagnoses.includes(diagnosis.Diagnosis.code__procedureCodeableConcept__SNOMED.toString())
  );
}

/** Check to see if the patient referenced by this claim is a current/former HHS employee or a relative thereof */
function isClaimForEmployeeOrRelative(claim) {
  return employeesAndRelatives.includes(claim.envelope.instance.Claim.patient.Reference.reference.toString().replace('Patient/', ''));
}

var contentArray;
var options;

traceObject(contentArray);
traceObject(options);

contentArray.forEach(content => {
  // If `content.value` is a Document, access the `root` property, otherwise treat `content.value` as a plain JS object
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
