'use strict';

const {
  CreatesNode,
  UsesRootNode,
  UsesStringValue,

  StringCipher,
  NumberCipher,
  CaseInsensitiveStringCipher,

  redactDateWithinRange,
  redactTimeWithinRange,

  getDateString,
  getTimeString,

  fromEntries,
} = require('/lib/redaction/redactionUtils.sjs');

const genericNumberCipher = new NumberCipher();

const uuidCipher = new CaseInsensitiveStringCipher('0123456789ABCDEF');

/**
 * Fetch a redacted value from a given redaction map
 *
 * @param  {string}  mapCollection  The map collection
 * @param  {string}  key            The source value key
 *
 * @return {string}
 */
function fetchRedactionMapValue(mapCollection, key) {
  return fn.head(
    xdmp.invokeFunction(
      () => fn.head(
        cts.valueMatch(
          cts.jsonPropertyReference('redactMapEntries'),
          `${key}:*`,
          null,
          cts.collectionQuery(mapCollection),
        ),
      ),
      { database: xdmp.database('%%mlContentDatabaseName%%'), update: 'false' },
    ),
  );
}

/**
 * Retrieve a cached value
 *
 * @param  {string}    key       The key of the cached value to retrieve
 * @param  {Function}  getValue  A function to provide a value to cache if there is not a cached value already
 *
 * @return {unknown}
 */
function getCachedValue(key, getValue) {
  let cached = xdmp.getServerField(key, null);

  if (cached) {
    return fn.head(cached);
  }

  cached = getValue();
  xdmp.setServerField(key, cached);

  return cached;
}

/**
 * Retrieve a cached Redaction Dictionary
 *
 * @param  {string}  dictionary  The dictionary name
 *
 * @return {unknown[]}
 */
function getCachedRedactionDictionary(dictionary) {
  return getCachedValue(
    dictionary,
    () => fn
      .head(xdmp.invokeFunction(() => cts.doc(dictionary), { database: xdmp.schemaDatabase() }))
      .toObject().dictionary.entry,
  );
}

/**
 * Redact a date within the given amount, returning an ISO-8601 date string
 *
 * @param  {string}  date     The date
 * @param  {Object}  options  The options as defined in the redaction rule definition
 *
 * @return {string}
 */
function redactDate(date, options) {
  return getDateString(redactDateWithinRange(date, { years: 3, ...options }));
}

/**
 * Redact a time within the given amount, returning an ISO-8601 time string
 *
 * @param  {string}  time     The time
 * @param  {Object}  options  The options as defined in the redaction rule definition
 *
 * @return {string}
 */
function redactTime(time, options) {
  return getTimeString(redactTimeWithinRange(time, { hours: 3, ...options }));
}

/**
 * Redact a date-time within the given amount, returning an ISO-8601 date-time string
 *
 * @param  {string}  datetime The date-time
 * @param  {Object}  options  The options as defined in the redaction rule definition
 *
 * @return {string}
 */
function redactDateTime(datetime, options) {
  return [redactDate(datetime, options), redactTime(datetime, options)].join('T');
}

/**
 * Redact the given value using a given precomputed redaction map
 *
 * @param  {string}  value    The value
 * @param  {Object}  options  The options as defined in the redaction rule definition
 *
 * @return {string}
 */
function redactMappedValue(value, options) {
  const mapCollection = `${options.name}RandomMap`;

  // Not sure if this is actually necessary, it's duplicating logic found in `fetchRedactionMapValue`
  /*return fn.head(
    xdmp.invokeFunction(
      () => {*/
        const result = fetchRedactionMapValue(mapCollection, value);

        return result
          ? result.toString().split(':')[1]
          : '';
      /*},
      { database: xdmp.database('%%mlContentDatabaseName%%'), update: 'false' },
    ),
  );*/
}

/**
 * Redact a given numeric value, with optional prefix and minimum result length
 *
 * @param  {string}        original  The original
 * @param  {Object}        options   The options as defined in the redaction rule definition
 *
 * @return {string}
 */
function redactNumeric(original, options) {
  const { prefix, length } = { prefix: '', length: 0, ...options };

  return prefix + new NumberCipher(length - prefix.length).encipher(original);
}

/**
 * Redact the UUID portion of a reference ID
 *
 * @param  {string}  reference  The reference (e.g.: Patient/00000000-0000-0000-0000-000000000000)
 * @param  {Object}  _options   The options as defined in the redaction rule definition
 *
 * @return {string}
 */
function redactReference(reference, _options) {
  const [prefix, ref] = reference.split('/');

  return [prefix, uuidCipher.encipher(ref)].join('/');
}

/**
 * Redact a street address deterministically by enciphering the street number and
 * picking a street name from the given Redaction Dictionary
 *
 * @param  {string}  address  The address
 * @param  {Object}  options  The options as defined in the redaction rule definition
 *
 * @return {string}
 */
function redactStreetAddress(address, options) {
  const [number, street] = address.split(/(?<=^\d+) /);
  const streetNames = getCachedRedactionDictionary(options.dictionary);
  const newNumber = genericNumberCipher.encipher(number);
  const newStreet = streetNames[xdmp.hash32(street) % streetNames.length];

  return `${newNumber} ${newStreet}`;
}

/**
 * Redact a given text value
 *
 * @param  {string}  text      The text
 * @param  {Object}  _options  The options as defined in the redaction rule definition
 *
 * @return {string}
 */
function redactText(text, options) {
  const Cipher = options.caseInsensitive
    ? CaseInsensitiveStringCipher
    : StringCipher;

  return new Cipher(options.charset).encipher(text);
}

/**
 * Redact a UUID
 * NOTE: Synonymous with `redactText` using { charset: '0123456789abcdef', caseInsensitive: true }
 *
 * @param  {string}  uuid      The uuid
 * @param  {Object}  _options  The options as defined in the redaction rule definition
 *
 * @return {string}
 */
function redactUuid(uuid, _options) {
  return uuidCipher.encipher(uuid);
}

/**
 * Redact a ZIP code
 * NOTE: Synonymous with `redactNumeric` using no additional options
 *
 * @param  {string}  zip       The zip
 * @param  {Object}  _options  The options as defined in the redaction rule definition
 *
 * @return {string}
 */
function redactZipCode(zip, _options) {
  return genericNumberCipher.encipher(zip);
}

module.exports = /*Object.*/fromEntries(
  Object.entries({
    redactDate: UsesStringValue(redactDate),
    redactDateTime: UsesStringValue(redactDateTime),
    redactMappedValue: UsesStringValue(redactMappedValue),
    redactNumeric: UsesStringValue(redactNumeric),
    redactReference: UsesStringValue(redactReference),
    redactStreetAddress: UsesStringValue(redactStreetAddress),
    redactText: UsesStringValue(redactText),
    redactTime: UsesStringValue(redactTime),
    redactUuid: UsesStringValue(redactUuid),
    redactZipCode: UsesStringValue(redactZipCode),
  })
    .map(([key, value]) => [key, CreatesNode(value)])
);
