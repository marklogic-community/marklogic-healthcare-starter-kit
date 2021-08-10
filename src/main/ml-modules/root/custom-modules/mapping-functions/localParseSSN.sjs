'use strict';

/**
* This custom mapping function serves as a parsing mechanism for handling both well-formed and malformed United States Social Security Numbers (SSN).  The usual dashes found in SSNs are allowed.
* For malformed numbers to be handled properly, they must still possess 9 digits in the string.  If the value passed in does not contain 9 digits, then a HSK-MALFORMED-SSN trace event can be logged if enabled. A null value is returned in this scenario.  
* 
* @param val: the SSN value being passed in for parsing.
* 
* Returns: a well-formed SSN value; or, a null node with a HSK-MALFORMED-SSN trace event.
* 
* Throws: not applicable.
*/

function localParseSSN(val) {
    let retVal;
    let escape = fn.replace(val, "-", "");
    if (fn.matches(val, "[0-9]{3}-[0-9]{2}-[0-9]{4}")) {
        retVal = val;
    } else if (fn.stringLength(escape) == 9 && fn.matches(escape, "[0-9]{9}")) {
        let tox = escape.split("");
        let first = tox.slice(0, 3).join("");
        let middle = tox.slice(3, 5).join("");
        let last = tox.slice(5, 9).join("");
        retVal = [first, middle, last].join("-");
    } else {
        retVal = fn.trace(retVal, "HSK-MALFORMED-SSN");
    }
    return retVal; 
}

module.exports = {
    localParseSSN
}