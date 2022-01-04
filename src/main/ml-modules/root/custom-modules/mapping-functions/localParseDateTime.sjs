'use strict';

/**
* Note: as a JavaScript mapping function, this will incur significant overhead at runtime. XPath/XSLT functions run much faster.
* 
* This custom mapping function serves as an alternative to the built-in mapping function parseDateTime.
* It uses a prepended "local" on the function name to distinguish it from the parseDateTime built-in.
* 
* Leverages Javascript Date handling and toISOString() method to produce ISO 8601 and XML Schema xs:dateTime compliant values.  DateTimes incoming already compliant with these specs simply pass through.
* 
* @param val: the date value being passed in for conversion.
* 
* Returns: an ISO 8601/xs:dateTime compliant dateTime value.
* 
* Throws: not applicable.
*/

function localParseDateTime(val) {
    let retVal;
    if (fn.stringLength(fn.normalizeSpace(val)) < 1) {
        retVal = null;
    } else {
        let thisDate = new Date(val).toISOString();
        retVal = xs.dateTime(thisDate);
    }
    return retVal; 
}

module.exports = {
    localParseDateTime
}