'use strict';

/**
* This custom mapping function serves as a corollary to the fn.distinctValues() function, which is not an available function in the Data Hub mapping utility.
* 
* Use in mapping steps where needed to determine distinct values from a sequence.
* 
* @param valueSeq: the sequence of values from which distincts will be determined.
* 
* Returns: a Sequence of distinct values.
* 
* Throws: Not applicable.
*/

function localDistinctValues(valuesSeq) {
    return fn.distinctValues(valuesSeq);
}

module.exports = {
    localDistinctValues
}
