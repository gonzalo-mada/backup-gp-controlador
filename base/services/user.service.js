"use strict";

var infoApp = require("../../package.json");

var invoker = require("../invokers/invoker.invoker");

var decryptToken = require("../utils/decryptToken");
var reply = require("../utils/reply");
var validador = require("../utils/validador");

var shared = require("./shared");

let getUser = async (request, response) => {
    try {
        let dataDecrypt = await decryptToken(request.headers.authorization);

        logger.log(
            `[${infoApp.name}] Ingresando...`,
            dataDecrypt.rut,
            dataDecrypt.nombreCompleto
        );

        let user = {
            rut: dataDecrypt.rut,
            nombres: dataDecrypt.nombres,
            apellidos: dataDecrypt.apellidos,
            nombreCompleto: dataDecrypt.nombreCompleto,
            correouv: dataDecrypt.correouv,
            mail: dataDecrypt.mail,
            fechaFinPassword: dataDecrypt.fechaFinPassword,
            foto: dataDecrypt.foto,
            idioma: dataDecrypt.idioma,
        };

        response.json(reply.ok(user));
    } catch (e) {
        response.json(reply.fatal(e));
    }
};

let saveKeyUser = async (request, response) => {
    try {
        let args = JSON.parse(
            request.body.arg === undefined ? "{}" : request.body.arg
        );
        let msg = validador.validarParametro(args, "cadena", "proyecto", true);
        msg += validador.validarParametro(args, "cadena", "modulo", true);
        msg += validador.validarParametro(args, "cadena", "token", true);
        msg += validador.validarParametro(args, "cadena", "params", false);

        if (msg == "") {
            let dataDecrypt = await decryptToken(args.token);

            let paramKey = {
                proyecto: args.proyecto,
                modulo: args.modulo,
                token: args.token,
            };

            if (args.hasOwnProperty("params")) {
                paramKey.params = args.params;
            }

            let idSesion = await shared.setKey(dataDecrypt.uid, paramKey);

            response.json(reply.ok(idSesion));
        } else {
            response.json(reply.error(msg));
        }
    } catch (e) {
        response.json(reply.fatal(e));
    }
};

let getKeyUser = async (request, response) => {
    try {
        let args = JSON.parse(
            request.body.arg === undefined ? "{}" : request.body.arg
        );
        let msg = validador.validarParametro(args, "cadena", "idSesion", true);

        if (msg == "") {
            let param = {
                idSesion: args.idSesion,
            };

            let dataKey = await invoker(
                global.config.serv_redis,
                "getKey",
                param
            );

            response.json(reply.ok(dataKey));
        } else {
            response.json(reply.error(msg));
        }
    } catch (e) {
        response.json(reply.fatal(e));
    }
};

module.exports = {
    getUser,
    saveKeyUser,
    getKeyUser,
};
