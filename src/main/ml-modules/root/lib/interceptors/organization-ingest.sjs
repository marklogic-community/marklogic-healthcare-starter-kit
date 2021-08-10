"use strict";
declareUpdate();

var contentArray;
var options;

xdmp.log(xdmp.quote(contentArray), "debug");
xdmp.log(xdmp.quote(options), "debug");

contentArray.forEach(content => {
    const orgId = content.value.envelope.instance.Id;
    content.context["uri"] = "/organization/" + orgId + ".json";
});