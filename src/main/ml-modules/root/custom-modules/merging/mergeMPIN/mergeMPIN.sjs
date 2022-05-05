const { getTraceHelpers } = require('/lib/util/trace-helpers.sjs');

const { trace, traceObject } = getTraceHelpers('mergeMPIN');

function toArray(arrayOrSequence) {
	return [].concat(arrayOrSequence.toArray ? arrayOrSequence.toArray() : arrayOrSequence);
}

function getOldestMasteredDocumentProperties(masterPropertyName, mpinValue, properties, propertySpec) {
	const uris = properties.map(x => toArray(x.sources).pop().documentUri);
	trace(`${masterPropertyName}: Input URIs: ${uris.join(', ')}`);

	// Find previously mastered documents in the sm-Patient-mastered collection
	const findMasterQuery = cts.andQuery([
		cts.collectionQuery('sm-Patient-mastered'),
		cts.orQuery([
			cts.jsonPropertyScopeQuery('headers', cts.jsonPropertyScopeQuery('merges', cts.jsonPropertyValueQuery('document-uri', uris))),
			cts.documentQuery(uris),
		]),
	]);

	const masteredDocUris = cts.uris(null, null, findMasterQuery).toArray();

	let masterDoc;
	// If there are no previously mastered documents, take the first input document as the master
	if (masteredDocUris.length === 0) {
		trace(`${masterPropertyName}: No previously mastered documents found, picking oldest incoming document`);

		masterDoc = cts.doc(uris[0]);
	} else {
		// If there are any previously mastered documents take the first as the master
		if (masteredDocUris.length === 1) {
			trace(`${masterPropertyName}: A single previously mastered document was found: ${masteredDocUris[0]}`);
		} else {
			trace(`${masterPropertyName}: Multiple previously mastered documents were found: ${masteredDocUris.join(', ')}`);
		}

		masterDoc = cts.doc(masteredDocUris[0]);
	}

	const mpin = masterDoc.toObject().envelope.instance.Patient[masterPropertyName];
	trace(`${masterPropertyName}: mpin: ${mpin}`);
	const propsWithMpin = properties.filter(p => toArray(p.values).map(v => String(v)).includes(mpin));

	trace(`${masterPropertyName}: propsWithMpin: ${xdmp.quote(propsWithMpin)}`);

	return propsWithMpin;
}

function getOldestMasteredProperty(value, properties, propertySpec) {
	return getOldestMasteredDocumentProperties(propertySpec.entityPropertyPath, value, properties, propertySpec);
}

module.exports = {
	getOldestMasteredProperty,
};
