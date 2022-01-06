'use strict';

/**
* This is a debugging function that can be temporarily added to a mapping step to understand intermediate or 
* complex results interactively in the mapping step GUI, 
*/

function quote(json) {
    return xdmp.quote(json)
}

module.exports = {
    quote
}
