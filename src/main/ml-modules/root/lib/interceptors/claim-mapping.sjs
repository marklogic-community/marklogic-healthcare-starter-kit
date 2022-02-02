"use strict";

const { getTraceHelpers } = require('/lib/util/trace-helpers.sjs');

declareUpdate();

const { trace, traceObject } = getTraceHelpers('claim-mapping');

const employeesAndRelatives = Array.from(cts.doc('/meta/employeesAndRelatives.json').root.ids).map(id => id.toString());
const snomedPsychDiagnoses = Array.from(cts.doc('/meta/psych-diagnoses.json').root.codes.snomed).map(code => code.toString());
const icd10cmPsychDiagnoses = Array.from(cts.doc('/meta/psych-diagnoses.json').root.codes.icd10cm).map(code => code.toString());

traceObject(employeesAndRelatives);
traceObject(snomedPsychDiagnoses);

const employeePsychReader = xdmp.permission('employee-psych-reader', 'read');
const employeeReader = xdmp.permission('employee-reader', 'read');
const psychReader = xdmp.permission('psych-reader', 'read');
const phiReader = xdmp.permission('phi-reader', 'read');

/** Check to see if any of the SNOMED diagnosis codes on the claim are psychological in nature */
function isPsychClaim(claim) {
  return Array.from(claim.envelope.instance.Claim.diagnosis || []).some(diagnosis => {
    const { code__diagnosisCodeableConcept__SNOMED: snomed, code__diagnosisCodeableConcept__ICD10CM: icd10cm } = diagnosis.Diagnosis;

    return (
      (snomed && snomedPsychDiagnoses.includes(snomed.toString())) ||
      (icd10cm && icd10cmPsychDiagnoses.includes(icd10cm.toString()))
    );
  });
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
