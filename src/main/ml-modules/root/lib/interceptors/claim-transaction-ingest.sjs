"use strict";
declareUpdate();

var contentArray;
var options;

const traceflag = "claim-tx-ingest"
if (xdmp.traceEnabled(traceflag)) {
    xdmp.trace(traceflag, "ingesting content: " + xdmp.quote(contentArray))
    xdmp.trace(traceflag, "ingest options: " + xdmp.quote(options))
}

contentArray.forEach(content => {
    const lineId = content.value.envelope.instance.ID;
    content.context["uri"] = "/claim_transaction/" + lineId + ".json";
});