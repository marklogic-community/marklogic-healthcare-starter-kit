const test = require("/test/test-helper.xqy"); // the test library is written in .xqy but we can call it from JS in MarkLogic

function loadTestFileToStagingWithPerms(fileShortName, uri, collections) {

  // the test does not need these, but if we turn off suiteTeardown we want to be able to read these docs in the Hub Central Mapper GUI
  const permissions =
	[xdmp.permission('data-hub-common', 'read'),
	 xdmp.permission('data-hub-common', 'update')]; 
 
  let doc = test.getTestFile(fileShortName)

  xdmp.invokeFunction(
     () => {
         declareUpdate()
         xdmp.documentInsert(uri, doc, {permissions: permissions, collections: collections})
     },
     {database: xdmp.database("data-hub-STAGING")} // mapping steps pull data from STAGING, so put the data there
    )
}

// set up a claim with two claim items and a location. 
// Set permissions and collections as they would be so the claim step can find the claim 
// and the documents will be accessible to Hub Central if the mapping step is run there in test mode on the /claim1.json URI
const collections = ["testclaim", "ClaimIngest"] // testclaim is for easy cleanup later; ClaimIngest is what the step expects
loadTestFileToStagingWithPerms("claim1.json", "/claim1.json", collections)
loadTestFileToStagingWithPerms("claimLine1.json", "/claimline1.json", ["testclaimline", "ClaimTransactionIngest"])
loadTestFileToStagingWithPerms("claimLine2.json", "/claimline2.json", ["testclaimline", "ClaimTransactionIngest"])
loadTestFileToStagingWithPerms("org1.json", "/organization1.json", ["testorganization", "OrganizationIngest"])
