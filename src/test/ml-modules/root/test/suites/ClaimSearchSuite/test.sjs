'use strict';

const test = require("/test/test-helper.xqy");

function runSearch(search, start = 0, limit = 100) {
  return fn.head(
    xdmp.invoke('/data-services/claim/search.sjs', {
      search: xdmp.quote(Array.isArray(search) ? search : [search]),
      start,
      limit,
    }),
  );
}

const baseLevelCode = 'http://snomed.info/sct/138875005'; // Base code for all of SNOMED-CT
const psychCode = 'http://snomed.info/sct/74732009';
const majorDepressionCode = 'http://snomed.info/sct/36923009';

const baseLevelNarrowerSearch = runSearch({
  field: 'diagnosis',
  modifier: 'below',
  value: baseLevelCode,
});

const psychNarrowerSearch = runSearch({
  field: 'diagnosis',
  modifier: 'below',
  value: psychCode,
});

const majorDepressionNarrowerSearch = runSearch({
  field: 'diagnosis',
  modifier: 'below',
  value: majorDepressionCode,
});

const baseLevelBroaderSearch = runSearch({
  field: 'diagnosis',
  modifier: 'above',
  value: baseLevelCode,
});

const psychBroaderSearch = runSearch({
  field: 'diagnosis',
  modifier: 'above',
  value: psychCode,
});

const majorDepressionBroaderSearch = runSearch({
  field: 'diagnosis',
  modifier: 'above',
  value: majorDepressionCode,
});

const assertions = [
  // Use `assertTrue(<comparison>)` instead of `assertEqual(expected, actual)` in case ingested claim documents are loaded
  test.assertTrue(1 <= baseLevelNarrowerSearch.length),
  test.assertTrue(1 <= psychNarrowerSearch.length),
  test.assertTrue(1 <= majorDepressionNarrowerSearch.length),
  test.assertEqual(0, baseLevelBroaderSearch.length),
  test.assertEqual(0, psychBroaderSearch.length),
  test.assertTrue(1 <= majorDepressionBroaderSearch.length),
];

assertions;
