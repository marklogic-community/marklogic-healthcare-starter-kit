const valueSetLookup = require("/custom-modules/mapping-functions/valueSetLookup.sjs").valueSetLookup

function getFieldNameFromPath(field) {
    var fieldSplit = field[field.length - 1].split("__")

    if (fieldSplit.length == 1) {
        return field
    } else if (fieldSplit[0] === "identifier") {
        return "identifier"
    } else if (fieldSplit[0] === "code") {
        return fieldSplit[1]
    }

    return fieldSplit
}

function buildIdentifierTemplate(use, system) {
    // create a default template the maps the value being processed to the identifier value
    var template = { value: function (value, doc) { return value } }

    // if there is a use, add it to the template
    if (use != null) {
        template.use = use;
    }

    // if there is a system, add it to the template
    if (system != null) {
        template.system = system;
    }

    return template;
}

function buildCodableConceptTemplate(system, lookupValueSet) {
    // create a default template
    var template = {
        coding: [{
            code: function (value, doc) { return value }
        }],
        text: function (value, doc) { return value }
    }

    // if there is a system, add it to the template coding
    if (system != null) {
        template.coding[0].system = system;
    }

    // if there is a lookupValueSet, add a lookup to the display value of the coding
    if (lookupValueSet != null) {
        template.coding[0].display = function (value, doc) {
            xdmp.log("display value = " + value[0])
            return fn.head(valueSetLookup(value, lookupValueSet)).display.toString()
        };
    }

    return template;
}

function buildTemplateConfig(oldConfig, newTemplate) {
    var pathSplit = oldConfig.path.split(".")
    var newConfig = {
        path: oldConfig.path,
        pathSplit: pathSplit,
        field: getFieldNameFromPath(pathSplit),
        isArray: oldConfig.isArray,
        template: newTemplate
    }

    return newConfig;
}

function buildRemoveConfig(path) {
    var pathSplit = path.split(".")
    var newConfig = {
        path: path,
        pathSplit: pathSplit,
        remove: true
    }

    return newConfig;
}

module.exports = {
    buildIdentifierTemplate,
    buildCodableConceptTemplate,
    buildTemplateConfig,
    buildRemoveConfig
}