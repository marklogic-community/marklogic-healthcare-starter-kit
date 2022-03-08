const test = require("/test/test-helper.xqy"); // the test library is written in .xqy but we can call it from JS in MarkLogic

declareUpdate();
xdmp.documentInsert('/00000000-0000-0000-0000-000000000000.json', test.getTestFile('claim.json'), {
  permissions: [xdmp.permission('data-hub-common', 'read'), xdmp.permission('data-hub-common', 'read')],
  collections: ['testClaim', 'Claim', 'ClaimMapping'],
});
