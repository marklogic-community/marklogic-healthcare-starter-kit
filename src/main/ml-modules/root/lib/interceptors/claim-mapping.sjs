"use strict";
declareUpdate();

const employeesAndRelatives = Array.from(cts.doc('/meta/employeesAndRelatives.json').root.ids).map(id => id.toString());
const psychDiagnoses = Array.from(cts.doc('/meta/psych-diagnoses.json').root.codes.snomed).map(code => code.toString());

xdmp.log(xdmp.quote(employeesAndRelatives), 'debug');
xdmp.log(xdmp.quote(psychDiagnoses), 'debug');

const employeePsychReader = xdmp.permission('employee-psych-reader', 'read');
const employeeReader = xdmp.permission('employee-reader', 'read');
const psychReader = xdmp.permission('psych-reader', 'read');
const phiReader = xdmp.permission('phi-reader', 'read');

function isPsychClaim(claim) {
  return psychDiagnoses.includes(claim.envelope.instance.Claim.diagnosis.Diagnosis.diagnosisCodeableConcept.text.toString());
}

function isClaimForEmployeeOrRelative(claim) {
  return employeesAndRelatives.includes(claim.envelope.instance.Claim.patient.Reference.reference.replace('Patient/', ''));
}

var contentArray;
var options;

xdmp.log(xdmp.quote(contentArray), "debug");
xdmp.log(xdmp.quote(options), "debug");

contentArray.forEach(content => {
	const claim = content.value.root || content.value;
	const isPsych = isPsychClaim(claim);

  /**
   * This interceptor checks to see if the patient's ID matches that of an employee/relative of an employee and
   * changes the read permissions on the data
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
