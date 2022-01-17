"use strict";
declareUpdate();

var contentArray;
var options;

const traceflag = "patient-ingest"
if (xdmp.traceEnabled(traceflag)) {
    xdmp.trace(traceflag, "ingesting content: " + xdmp.quote(contentArray))
    xdmp.trace(traceflag, "ingest options: " + xdmp.quote(options))
}

contentArray.forEach(content => {
    /**
    * This interceptor grabs the Id value from the incoming data, and uses it in the data-hub-STAGING persistence URI for persistence.
    * It uses a prepended "local" on the function name to distinguish it from the parseDateTime built-in.
    */
    const patientId = content.value.envelope.instance.Id;
    content.context["uri"] = "/patient/" + patientId + ".json";
});