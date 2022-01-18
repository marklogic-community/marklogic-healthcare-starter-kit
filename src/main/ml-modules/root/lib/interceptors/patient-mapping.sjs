"use strict";
const { getTraceHelpers } = require('/lib/util/trace-helpers.sjs');

declareUpdate();

const { trace, traceObject } = getTraceHelpers('patient-mapping');

const employeesAndRelatives = Array.from(cts.doc('/meta/employeesAndRelatives.json').root.ids).map(id => id.toString());

traceObject(employeesAndRelatives);

const employeeReader = xdmp.permission('employee-reader', 'read');
const phiReader = xdmp.permission('phi-reader', 'read');

/** Check if the patient's ID matches that of a current/former HHS employee or a relative thereof */
function isEmployeeOrRelative(patient) {
  return employeesAndRelatives.includes(patient.envelope.instance.Patient.id.toString());
}

/** Predicate to filter non-Patient content values during post-merge run */
function isPatient(value) {
  return !!value.envelope;
}

var contentArray;
var options;

traceObject(contentArray);
traceObject(options);

contentArray.forEach(content => {
  const value = content.value.root || content.value;

  // Patient merge step includes results that are not patients, filter those out before processing permissions
  if (!isPatient(value)) {
    return;
  }

  /**
   * This interceptor checks to see if the patient's ID matches that of an employee/relative of an employee and
   * changes the read permissions on the data
   */
  content.context.permissions.push(
    isEmployeeOrRelative(value)
      ? employeeReader
      : phiReader
  );
});
