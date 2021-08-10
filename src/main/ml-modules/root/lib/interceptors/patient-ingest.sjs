"use strict";
declareUpdate();

var contentArray;
var options;

xdmp.log(xdmp.quote(contentArray), "debug");
xdmp.log(xdmp.quote(options), "debug");

contentArray.forEach(content => {
    /**
    * This interceptor grabs the Id value from the incoming data, and uses it in the data-hub-STAGING persistence URI for persistence.
    * It uses a prepended "local" on the function name to distinguish it from the parseDateTime built-in.
    */
    const patientId = content.value.envelope.instance.Id;
    content.context["uri"] = "/patient/" + patientId + ".json";
});