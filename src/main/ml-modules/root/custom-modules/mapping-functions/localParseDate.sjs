'use strict';

/**
* Note: as a JavaScript mapping function, this will incur significant overhead at runtime. XPath/XSLT functions run much faster.
*
* This custom mapping function serves as an alternative to the built-in mapping function parseDate, which couldn't directly handle the abbreviated year found in the date format used by this project's sample input data.
* It uses a prepended "local" on the function name to distinguish it from the parseDate built-in.
* 
* Leverages Javascript Date handling and toISOString() method to produce ISO 8601 and XML Schema xs:date compliant values.  Dates incoming already compliant with these specs simply pass through.
* 
* @param val: the date value being passed in for conversion.
* 
* Returns: an ISO 8601/xs:date compliant date value.
* 
* Throws: not applicable.
*/
 
function localParseDate(val) {
    let retVal;
    if (fn.contains(val, "/")) {
        let thisDate = new Date(val).toISOString();
        retVal = xs.date(fn.substringBefore(thisDate, "T"));
    } else if (fn.stringLength(fn.normalizeSpace(val)) < 1) {
        retVal = null;
    } else {
        retVal = xs.date(val);
    }
    return retVal; 
}

module.exports = {
    localParseDate
}