"use strict";
declareUpdate();

var contentArray;
var options;

xdmp.log(xdmp.quote(contentArray), "debug");
xdmp.log(xdmp.quote(options), "debug");

contentArray.forEach(content => {
    const lineId = content.value.envelope.instance.ID;
    content.context["uri"] = "/claim_transaction/" + lineId + ".json";
});