'use strict';

/**
 * Works like a mini mapping step to take multiple fields from a flat structure and turn
 * them into custom nodes for processing as a DHF context.
 * 
 * Based the breakout of the config string, the function creates a node that has 3 elements:
 * - type: the type from the config object
 * - source: the result of applying the xpath to the flat structure passed in
 * - parent: the flat structure that was passed in (this lets you gain access to sibling elements as needed)
 * 
 * @param flatStructure the flat structure that needs to be broken into multiple nodes
 * @param configString the string representation of an object that defines how to break the flat structure into multiple nodes
 * 
 * Takes the form of:
 * {
 *  "breakout": [
 *    {
 *      "type": `some type`
 *      "xpath": `some xpath`
 *    },
 *    ...
 *  ]
 * }
 */
function flatToMultipleEntries(flatStructure, configString) {
  var config = JSON.parse(configString)
  var nodes = []
  // loop throug the break out configs
  for (var breakout of config.breakout) {
    // loop through the result of applying the xpath to the flat node
    for (var result of flatStructure.xpath(breakout.xpath)) {
      //build a new node for each result
      const builder = new NodeBuilder()
      builder.addNode({
        type: breakout.type,
        source: result,
        parent: flatStructure
      })
      // add the new node to the result list
      nodes.push(builder.toNode())
    }
  }
  // return a sequence of nodes (required by DHF)
  return Sequence.from(nodes)
}

module.exports = {
 flatToMultipleEntries
}
