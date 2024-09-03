'use strict';

let toTitleCase = (text) => {
    return text 
    .toLowerCase() 
    .split(' ') 
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

module.exports = { toTitleCase };