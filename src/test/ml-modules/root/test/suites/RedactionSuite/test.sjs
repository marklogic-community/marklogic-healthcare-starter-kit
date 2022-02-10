'use strict';

const rdt = require('/MarkLogic/redaction.xqy');
const test = require('/test/test-helper.xqy');

const redactionFunctions = require('/lib/redaction/redactionFunctions.sjs');
const {
  StringCipher,
  NumberCipher,
  CaseInsensitiveStringCipher,

  verifyRedaction,
} = require('/lib/redaction/redactionUtils.sjs');

/**
 * Guarantees that a given cipher produces reversible output
 *
 * @param  {string}   input             The input
 * @param  {Function} Cipher            The cipher
 * @param  {string?}  [charset='']      The charset to use in the cipher (optional)
 * @param  {string?}  [expected=input]  The expected output (optional)
 *
 * @return {assertion}
 */
function testCipher(input, Cipher, charset = '', expected = input) {
  const cipher = new Cipher(charset ? charset : undefined);

  return test.assertEqual(expected, cipher.decipher(cipher.encipher(input)));
}

/**
 * Checks that the given redaction function produces deterministic output with the same input and options
 *
 * @param  {string}    input         The input
 * @param  {string}    expected      The expected
 * @param  {Function}  fn            The function
 * @param  {Object}    [options={}]  The options
 *
 * @return {assertion}
 */
function testRedactionFunction(fn, input, options = {}, expected) {
  return test.assertEqual(expected, fn(input, options).toString());
}

/**
 * Runs all redaction rules from the given ruleset on the given document, and then checks to make sure
 * that all given redaction paths have been redacted
 *
 * @param  {Document}  doc                     The document
 * @param  {string}    ruleset                 The ruleset
 * @param  {Object}    pathsAndExpectedValues  An object containing xpath paths as keys and the expected
 *                                             redaction output as the values
 *
 * @return {assertion[]}
 */
function testRedaction(doc, ruleset, pathsAndExpectedValues) {
  const redacted = fn.head(rdt.redact(doc, ruleset));

  const failures = verifyRedaction(doc, redacted, Object.keys(pathsAndExpectedValues))
    .filter(test => !test.success);

  return [
    test.assertTrue(
      failures.length == 0,
      failures.map(f => `Redaction of ${f.path} in ${f.document} failed.`).join('\n'),
    ),
    ...Object
      .entries(pathsAndExpectedValues)
      .map(([path, expected]) => {
        const actual = redacted.xpath(path).toArray().map(v => v.toString());

        return test.assertTrue(
          actual.every(v => v === expected),
          `${path}: Expected all matching paths to have value "${expected}". Got: [${actual.map(v => `"${v}"`).join(', ')}]`,
        );
      }),
  ];
}

const assertions = [
  // Test various redaction utilities and functions to verify correct functionality
  testCipher('test string', StringCipher),
  testCipher('1987', NumberCipher),
  testCipher('ThIs iS A TeSt sTrInG WiTh mIxEd cApItAlIzAtIoN', CaseInsensitiveStringCipher, undefined, 'this is a test string with mixed capitalization'),
  testRedactionFunction(redactionFunctions.redactDate, '2021-03-05T13:15:23Z', { years: 3 }, '2022-05-17'),
  testRedactionFunction(redactionFunctions.redactTime, '2021-03-05T13:15:23Z', { hours: 3 }, '13:33:00.000Z'),
  testRedactionFunction(redactionFunctions.redactDateTime, '2021-03-05T13:15:23Z', { years: 3, hours: 3 }, '2023-05-30T01:33:00.000Z'),
  testRedactionFunction(redactionFunctions.redactDictionaryDeterministic, 'test', { dictionary: '/redaction/dictionaries/firstNames.json' }, 'Anthony'),
  testRedactionFunction(redactionFunctions.redactNumeric, '56723', { prefix: 'K', length: 10 }, 'K581426082'),
  testRedactionFunction(redactionFunctions.redactReference, 'Patient/12345678-1234-1234-1234-123456789ABC', {}, 'Patient/6a48c6ae-348c-598c-5937-a459d7bfe2c0'),
  testRedactionFunction(redactionFunctions.redactStreetAddress, '4257 N 10th St', { dictionary: '/redaction/dictionaries/streetNames.json' }, '9061 Main St'),
  testRedactionFunction(redactionFunctions.redactUuid, '12345678-1234-1234-1234-123456789ABC', {}, '6a48c6ae-348c-598c-5937-a459d7bfe2c0'),
  testRedactionFunction(redactionFunctions.redactZipCode, '80123', {}, '38260'),
  // Test Patient redaction
  ...testRedaction(test.getTestFile('livePatient.json'), 'member-redaction', {
    '//Address/(line|text)': '127 Lois Ln',
    '//birthDate': '2011-03-12',
    '//deceasedBoolean': '',
    '//deceasedDateTime': '',
    // '//HumanName/family': '',
    // '//HumanName/given': '',
    '//id': '581914af-f370-5ed5-81af-80139c431f82',
    '//identifier__ssn': '###-##-2763',
    '//postalCode': '88227',
  }),
  ...testRedaction(test.getTestFile('deadPatient.json'), 'member-redaction', {
    '//Address/(line|text)': '317 Oriental Ave',
    '//birthDate': '1962-05-30',
    '//deceasedBoolean': '',
    '//deceasedDateTime': '1962-12-01T19:50:19.000Z',
    // '//HumanName/family': '',
    // '//HumanName/given': '',
    '//id': 'a2a10805-6551-8ac6-0012-ff6a93a5b915',
    '//identifier__ssn': '###-##-5413',
    '//postalCode': '88456',
  }),
  // Test Claim redaction
  ...testRedaction(test.getTestFile('claim.json'), 'claim-redaction', {
    '//patient/Reference/reference': 'Patient/00330d3a-360c-db83-fb0f-585a5b5584af',
  }),
];

assertions;
