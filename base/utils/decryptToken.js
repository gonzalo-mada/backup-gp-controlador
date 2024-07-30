'use strict';

var encryption = require('./encryption');
var readToken = require('./readToken');
var reply = require('./reply');


module.exports = async (token) => {
    if (token) {
        let dataToken = await readToken(token);

        return JSON.parse(encryption.decrypt(dataToken));;
    } else {
        throw reply.fatal('tokenError: no encontrado').error;
    }
};
