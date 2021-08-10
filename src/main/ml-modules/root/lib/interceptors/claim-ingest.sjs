"use strict";
declareUpdate();

var contentArray;
var options;

xdmp.log(xdmp.quote(contentArray), "debug");
xdmp.log(xdmp.quote(options), "debug");

contentArray.forEach(content => {
    const claimId = content.value.envelope.instance.Id;
    content.context["uri"] = "/claim/" + claimId + ".json";
});