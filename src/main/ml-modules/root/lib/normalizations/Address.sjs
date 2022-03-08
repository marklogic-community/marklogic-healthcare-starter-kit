const regionMap = new Map();

/**
 * Gets the cached region localizations.
 *
 * @param  {string}  region  The region, e.g.: 'en-US'
 *
 * @return {Object}
 */
function getCachedRegionLocalizations(region) {
	if (!regionMap.has(region)) {
		regionMap.set(region, require(`./address-localizations/${region}.sjs`));
	}

	return regionMap.get(region);
}

class Address {
	/**
	 * Performs basic address normalization on lines 1 & 2 of a given address for a given region
	 *
	 * @param  {string}   line1             Address line 1
	 * @param  {string}   line2             Address line 2
	 * @param  {string}   [region='en-US']  The region to normalize for
	 *
	 * @return {Address}
	 */
	static from(line1, line2, region = 'en-US') {
		const localization = getCachedRegionLocalizations(region);

		// Street address number should always be the first token, use all others to determine street name & unit number (if any)
		const [number, ...location] = [line1, line2] // Combine lines 1 & 2
			.filter(Boolean)                           // Filter out null/undefined/empty values
			.join(' ')                                 // Join into a single string
			.trim()                                    // Trim excess whitespace
			.replace(/[^0-9a-z#\s-]/gi, '')            // Remove punctuation, etc. (NOTE: May remove characters we want to keep, investigate)
			.split(/(?<=#)|\s+/g)                      // Tokenize on spaces or a preceding # (e.g.: '#102', '# 102' BOTH -> ['#', '102'])
			.map(localization.normalize);              // Normalize tokens
		const l = location.length;

		const street = [];
		let unit = '';

		for (let i = 0; i < l; i++) {
			const part = location[i];

			if (part === '#') { // NOTE: Should be last token but may not be, allow street address to continue afterward
				unit = location[++i];
			} else {
				street.push(part);
			}
		}

		// Returns an address object with relevant street name tokens coerced to a canonical form
		return new Address(number, street.map(localization.coerce).join(' '), unit);
	}

	/**
	 * @param  {string}  number  Street number
	 * @param  {string}  street  Street name
	 * @param  {string}  unit    Unit number/letter/etc.
	 */
	constructor(number, street, unit) {
		this.number = number;
		this.street = street;
		this.unit = unit;
	}

	/**
	 * Address line 1
	 *
	 * @type   {string}
	 */
	get line1() {
		return [this.number, this.street].join(' ').trim();
	}

	/**
	 * Address line 2 (if any)
	 *
	 * @type   {string}
	 */
	get line2() {
		return this.unit ? `#${this.unit}` : undefined;
	}

	/**
	 * Combined address lines 1 and 2
	 *
	 * @type   {string}
	 */
	get canonical() {
		return [this.line1, this.line2].filter(Boolean).join(' ').trim();
	}
}

module.exports = Address;
