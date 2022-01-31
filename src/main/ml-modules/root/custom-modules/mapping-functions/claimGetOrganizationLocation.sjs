'use strict';

/**
* Note: as a JavaScript mapping function, this will incur significant overhead at runtime. XPath/XSLT functions run much faster.
*
* This custom mapping function is used to determine organization locations involved in a Claim and its associated "claim lines".
* Important: there is a dependency and assumption that this function is used in conjunction with the provided claimGetLines custom mapping function, which should serve as the "sourcedFrom" sequence of nodes for context.
* Any given claim line in the sample data references an organization where a service was performed.  That organization will in turn have a location.  
* Therefore we assume that the provided sample organizations data has been ingested into data-hub-STAGING, as this function executes a cts.search against the OrganizationIngest collection to fetch the location information. 
* 
* @param placeOfServiceId: the organization ID from any given claim line associated with the claim at hand.
* 
* Returns: A Sequence, built from a singular JSON Object possessing an "organization" property detailing the organization locations across claim transactions. 
* 
* Throws: not applicable.
* 
* Example usage (e.g. PLACEOFSERVICE from the XPath below yields "2f5ed0cf-6fbc-3413-9e96-abb7b91d3421"): 
* claimGetOrganizationLocation(./claimLine/PLACEOFSERVICE/normalize-space())
* returns...
* Sequence object containing {"organization":{"Id":"2f5ed0cf-6fbc-3413-9e96-abb7b91d3421", "NAME":"NORTHSIDE HOSPITAL FORSYTH", "ADDRESS":"1200 NORTHSIDE FORSYTH DRIVE", "CITY":"CUMMING", "STATE":"GA", "ZIP":"30041", "LAT":"34.207649", "LON":"-84.13357099999998", "PHONE":"7708443200", "REVENUE":"0.0", "UTILIZATION":"357"}}
*/

function claimGetOrganizationLocation(placeOfServiceId) {
  let nodes = [];
  // Performance note: we use a path index to avoid building a larger index with every Id in the system. But a simple jsonPropertyRangeQuery on an Id will also work
  // It is NOT a best practice to use jsonPropertyValueQuery for Id values in a batch; that accesses many different index structures
  // By using a range index, a single range index structure is memory mapped and available without excessive I/O
  let search = cts.search(
    cts.andQuery([
        cts.jsonPropertyValueQuery("Id", placeOfServiceId),
        cts.collectionQuery("OrganizationIngest")
    ])
  );
  for (var hit of search) {
    let builder = new NodeBuilder();
    let doc = hit.root.envelope.instance;
    builder.addNode({
      "organization": doc
    });
    nodes.push(builder.toNode());
  }
  return Sequence.from(nodes);
}

module.exports = {
    claimGetOrganizationLocation
}
