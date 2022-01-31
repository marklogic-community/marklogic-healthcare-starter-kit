function unwrapES(node) {
    if (node instanceof Array) {
        return node.map(unwrapES)
    } else if (node instanceof Object) {
        if ("__skipUnwrap" in node) {
            delete node["__skipUnwrap"]
            return node
        }
        var instanceKey = Object.keys(node).find(element => element != "info")
        var newNode = node[instanceKey]
        for (var child in newNode) {
            newNode[child] = unwrapES(newNode[child])
            if (newNode[child] == null) {
                delete newNode[child]
            }
        }
        if (newNode.hasOwnProperty('$ref')) {
            return null
        }
        return newNode
    } else {
        return node
    }
}

function unwrapEnvelope(doc) {
    return unwrapES(doc.envelope.instance)
}

module.exports = {
    unwrapEnvelope
}