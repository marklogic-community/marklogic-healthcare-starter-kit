'use strict';
const { getTraceHelpers } = require('/lib/util/trace-helpers.sjs');

var contentArray;
var options;

var dataType;

const { trace, traceObject } = getTraceHelpers(`post-clean-${dataType}`);

traceObject(contentArray);
traceObject(options);

/**
 * Since a mapping step discards all data not explicitly mapped we need to restore the original
 * document instance into the result, overwriting with mapped values as necessary
 */
contentArray.forEach(content => {
  const doc = content.value;
  const origInstance = content.instance;

	const envelope = doc.root.envelope;
	const cleaned = envelope.instance.cleaned;

	content.value = new NodeBuilder()
		.addNode({
			envelope: {
				...envelope,
				instance: {
					...origInstance,
					cleaned,
				},
			},
		})
		.toNode();
});
