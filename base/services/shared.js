'use strict';

var invoker = require('../invokers/invoker.invoker');

var encryption = require('../utils/encryption');

let setKey = async (rut, param) => {
    let data =
        Math.floor(Math.random() * 9000000) +
        987654321 +
        "." +
        rut +
        "." +
        param.proyecto +
        "." +
        new Date().getTime();

    let idSesion = encryption.encrypt(data);
    idSesion = idSesion.split('/').join('a');
    idSesion = idSesion.split('+').join('b');
    idSesion = idSesion.split('=').join('c');

    param.idSesion = idSesion;

    return await invoker(global.config.serv_redis, 'setKey', param);
};

module.exports = {
    setKey,
};
