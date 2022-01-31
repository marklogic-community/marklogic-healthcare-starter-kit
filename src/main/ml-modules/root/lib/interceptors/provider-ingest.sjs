"use strict";
declareUpdate();

var contentArray;
var options;

const traceflag = "provider-ingest"
if (xdmp.traceEnabled(traceflag)) {
    xdmp.trace(traceflag, "ingesting content: " + xdmp.quote(contentArray))
    xdmp.trace(traceflag, "ingest options: " + xdmp.quote(options))
}

contentArray.forEach(content => {
    const providerId = content.value.envelope.instance.Id;
    content.context["uri"] = "/provider/" + providerId + ".json";
});