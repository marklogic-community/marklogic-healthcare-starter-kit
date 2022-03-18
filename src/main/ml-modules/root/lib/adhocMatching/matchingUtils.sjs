
const dhfmastering = require('/data-hub/5/builtins/steps/mastering/default/matching.sjs')

const noOpURI = 'noOpURI'

function match(doc, stepName) {

    var content = {
        'uri': noOpURI,
        'value': doc
    }

    var options = {
        'stepId': stepName
    }

    return dhfmastering.main([content], options, null)
}

function extractURIMatchesFromSummary(summary) {
    var restuls = {}
    var details = summary.value.matchSummary.actionDetails

    for (var matchKey in details) {
        var match = details[matchKey]
        var fieldName = match.action == "merge" ? "merge" : match.threshold

        restuls[fieldName] = match.uris.filter(function (e) { return e !== noOpURI })
    }
    return restuls
}

function getIdsFromMatchURIs(summary, xpath) {
    var results = {}

    for (var matchKey in summary) {
        var match = summary[matchKey]
        var preliminaryIds = []

        for (var doc of fn.doc(match)) {
            preliminaryIds.push(doc.xpath(xpath))
        }
        results[matchKey] = fn.distinctValues(preliminaryIds)
    }
    return results
}

function getDocsFromMatchURIs(summary) {
    var results = {}

    for (var matchKey in summary) {
        var match = summary[matchKey]
        var docs = []

        for (var doc of fn.doc(match)) {
            preliminaryIds.push(doc.xpath(xpath))
        }
        results[matchKey] = fn.distinctValues(preliminaryIds)
    }
    return results
}

module.exports = {
    match,
    extractURIMatchesFromSummary,
    getIdsFromMatchURIs
}