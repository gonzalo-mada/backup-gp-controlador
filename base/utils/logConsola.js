"use strict";

var dateFormat = require("dateformat");

let getDataFormat = () => {
    return dateFormat(new Date(), "dd/mm/yyyy HH:MM:ss");
};

let log = (msg, ...moreMsg) => {
    if (moreMsg != undefined && moreMsg.length > 0) {
        console.log(getDataFormat(), msg, ...moreMsg);
    } else {
        console.log(getDataFormat(), msg);
    }
};

let error = (msg, ...moreMsg) => {
    if (moreMsg != undefined && moreMsg.length > 0) {
        console.error(getDataFormat(), msg, ...moreMsg);
    } else {
        console.error(getDataFormat(), msg);
    }
};

module.exports = {
    log,
    error,
};
