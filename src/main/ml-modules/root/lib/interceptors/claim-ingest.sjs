"use strict";
// step interceptor to set the URI to a known pattern including the business ID

declareUpdate();

var contentArray;
var options;

const traceflag = "claim-ingest"
if (xdmp.traceEnabled(traceflag)) {
    xdmp.trace(traceflag, "ingesting content: " + xdmp.quote(contentArray))
    xdmp.trace(traceflag, "ingest options: " + xdmp.quote(options))
}

contentArray.forEach(content => {
    const claimId = content.value.envelope.instance.Id;
    content.context["uri"] = "/claim/" + claimId + ".json";
});