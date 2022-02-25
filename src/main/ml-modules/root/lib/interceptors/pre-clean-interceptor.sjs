'use strict';
const { getTraceHelpers } = require('/lib/util/trace-helpers.sjs');

var contentArray;
var options;

var dataType;

const { trace, traceObject } = getTraceHelpers(`pre-clean-${dataType}`);

traceObject(contentArray);
traceObject(options);

/**
 * Injects the original document instance into the content object so that it can be restored after
 * the clean step is finished running
 */
contentArray.forEach(content => {
  const doc = content.value;
	const instance = doc.root.envelope.instance;

	content.instance = instance;
});
