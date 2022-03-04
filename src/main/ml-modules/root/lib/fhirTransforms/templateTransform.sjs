const th = require("templateHelpers.sjs")
const esu = require("esUnwrapper.sjs")

function buildTemplateConfig(oldConfig, newTemplate) {
    var newConfig = {
        path: oldConfig.path,
        pathSplit: oldConfig.path.split("."),
        field: getFieldNameFromPath(pathSplit),
        isArray: oldConfig.isArray,
        template: newTemplate
    }

    return newConfig;
}

function traversePath(parent, current, path, pathindex, config, doc) {
    //end the recursion when we get to the end of the path
    if (path.length === pathindex) {
        if (Array.isArray(current)) {
            for (var currentElement of current) {
                applyTemplateConfig(parent, currentElement, config, doc)
            }
        } else {
            applyTemplateConfig(parent, current, config, doc)
        }
        delete parent[path[path.length - 1]]
        return
    }

    //get the next level
    var newParent = current
    var newCurrent = current[path[pathindex]]
    pathindex++
    xdmp.log(pathindex)
    if (current == null) {
        return null
    }

    if (Array.isArray(newCurrent)) {
        for (var currentElement of newCurrent) {
            traversePath(newParent, currentElement, path, pathindex, config, doc)
        }
    } else {
        traversePath(newParent, newCurrent, path, pathindex, config, doc)
    }
}

function applyTemplateConfig(parent, current, config, doc) {
    xdmp.log("Applying config")
    xdmp.log("current = " + JSON.stringify(current))

    if (config.remove === true) {
        delete parent[config.field]
        return;
    }

    if (!(config.field in parent) && config.isArray === true) {
        parent[config.field] = []
    }

    var newNode = applyTemplate(config.template, current, doc)

    xdmp.log(newNode)

    if (config.isArray === true) {
        parent[config.field].push(newNode)
    } else {
        parent[config.field] = newNode
    }
}

function applyTemplate(tempate, node, doc, firstLayer = true) {
    xdmp.log("Applying template")
    var newNode = {}
    if (firstLayer) {
        newNode["__skipUnwrap"] = true
    }
    for (var key in tempate) {
        switch (typeof tempate[key]) {
            case "string":
                xdmp.log(key + " = (string)" + tempate[key])
                newNode[key] = tempate[key]
                break;
            case "function":
                xdmp.log(key + " = function")
                newNode[key] = tempate[key](node, doc)
                break;
            case "object":
                xdmp.log(key + " =  object")
                if (Array.isArray(tempate[key])) {
                    newNode[key] = []
                    for (var item of tempate[key]) {
                        newNode[key].push(applyTemplate(item, node, doc, false))
                    }
                } else {
                    newNode[key] = applyTemplate(tempate[key], node, doc, false)
                }
                break;
            default:
                xdmp.log(key + " = " + tempate[key])
                newNode[key] = typeof node[key];
        }
    }
    return newNode
}


function transform(config, doc) {
    var templatesToApply = []

    //convert remove configs to templates
    if ('remove' in config) {
        for (var removePath of config.remove) {
            var newConfig = th.buildRemoveConfig(removePath)

            templatesToApply.push(newConfig)
        }
    }

    //convert codable concept configs to templates
    if ('codableConcept' in config) {
        for (var codeableConceptConfig of config.codableConcept) {
            var template = th.buildCodableConceptTemplate(codeableConceptConfig.system, codeableConceptConfig.lookupValueSet)
            var newConfig = th.buildTemplateConfig(codeableConceptConfig, template)

            templatesToApply.push(newConfig)
        }
    }

    //convert identifier configs to templates
    if ('codableConcept' in config) {
        for (var identifierConfig of config.identifier) {
            var template = th.buildIdentifierTemplate(identifierConfig.use, identifierConfig.system)
            var newConfig = th.buildTemplateConfig(identifierConfig, template)
            newConfig.isArray = true
            templatesToApply.push(newConfig)
        }
    }

    if ("root" in doc)
        doc = doc.toObject()

    //apply configs
    for (var config of templatesToApply) {
        var parent = null
        var current = doc
        xdmp.log("Path: " + config.pathSplit)
        traversePath(parent, current, config.pathSplit, 0, config, doc)
    }

    //flatten
    return esu.unwrapEnvelope(doc)
}

module.exports.transform = transform