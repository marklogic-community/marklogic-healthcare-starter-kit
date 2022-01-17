"use strict";
declareUpdate();

const employeesAndRelatives = Array.from(cts.doc('/meta/employeesAndRelatives.json').root.ids).map(id => id.toString());

xdmp.log(xdmp.quote(employeesAndRelatives), 'debug');

const employeeReader = xdmp.permission('employee-reader', 'read');
const phiReader = xdmp.permission('phi-reader', 'read');

function isEmployeeOrRelative(patient) {
  return employeesAndRelatives.includes(patient.envelope.instance.Patient.id.toString());
}

var contentArray;
var options;

xdmp.log(xdmp.quote(contentArray), "debug");
xdmp.log(xdmp.quote(options), "debug");

contentArray.forEach(content => {
  /**
   * This interceptor checks to see if the patient's ID matches that of an employee/relative of an employee and
   * changes the read permissions on the data
   */
  content.context.permissions.push(
    isEmployeeOrRelative(content.value.root || content.value)
      ? employeeReader
      : phiReader
  );
});
