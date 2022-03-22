'use strict';
const { getTraceHelpers } = require('/lib/util/trace-helpers.sjs');

var contentArray;
var options;

var entireRecord;
var entries;

const { trace, traceObject } = getTraceHelpers('flat-to-multiple');

traceObject(contentArray);
traceObject(options);
traceObject(entries);

/**
 * Works like a mini mapping step to take multiple fields from a flat structure and turn
 * them into custom nodes for processing as a DHF context.
 *
 * Based the breakout of the config string, the function creates and returns a Node that has 3 elements:
 * - type: the type from the config object
 * - source: the result of applying the xpath to the flat structure passed in
 * - parent: the flat structure that was passed in (this lets you gain access to sibling elements as needed)
 * Note that rather than a simple JavaScript object, the returned object/JSON is converted to a Node structure to mimic persisted data
 *
 * @param flatStructure the flat structure that needs to be broken into multiple nodes
 * @param configString the string representation of an object that defines how to break the flat structure into multiple nodes
 *
 * Takes the form of:
 * {
 *  "breakout": [       // hardcoded
 *    {
 *      "type": `some type`      // often a static string constant
 *      "xpath": `some xpath`    // where to get the value tagged with 'type'
 *    },
 *    ...
 *  ]
 * }
 *
 * Often used to take an incoming non-array structure and map it to an array property.
 *
 * Current example usage found in Patient Name mappings.
 */
function flatToMultipleEntries(node, breakouts) {
	return breakouts.reduce((acc, breakout) => acc.concat(node.xpath(breakout.xpath).toArray().map(source => ({ type: breakout.type, source }))), []);
}

/**
 * Since a mapping step discards all data not explicitly mapped we need to restore the original
 * document instance into the result, overwriting with mapped values as necessary
 */
contentArray.forEach(content => {
  const doc = content.value;
  const envelope = doc.root.envelope;
  const instance = envelope.instance;

  const record = entireRecord ? doc : doc.xpath('envelope/instance').toArray()[0];
  const results = {};

  for (const { dest, breakouts } of entries) {
  	results[dest] = flatToMultipleEntries(record, breakouts);
  }

  const newInstance = {
  	...instance,
  	...results,
  };

  content.value = new NodeBuilder().addNode(entireRecord ? { ...envelope, instance: newInstance } : newInstance).toNode();
});
