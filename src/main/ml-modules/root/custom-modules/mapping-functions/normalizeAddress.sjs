const Address = require('/lib/normalizations/Address.sjs');

function addressLine1(line1, line2, region) {
	// NOTE: XSLT Mapper inserts `null` for empty arguments to JS functions, so we need to convert
	// `null` -> `undefined` for default parameter substitution to work
	return Address.from(line1, line2, region || undefined).line1;
}

function addressLine2(line1, line2, region) {
	// NOTE: XSLT Mapper inserts `null` for empty arguments to JS functions, so we need to convert
	// `null` -> `undefined` for default parameter substitution to work
	return Address.from(line1, line2, region || undefined).line2;
}

function addressLinesCombined(line1, line2, region) {
	// NOTE: XSLT Mapper inserts `null` for empty arguments to JS functions, so we need to convert
	// `null` -> `undefined` for default parameter substitution to work
	return Address.from(line1, line2, region || undefined).canonical;
}

module.exports = {
	addressLine1,
	addressLine2,
	addressLinesCombined,
}
