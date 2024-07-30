"use strict";

var invoker = require("../invokers/invoker.invoker");

var decryptToken = require("../utils/decryptToken");
var loadConfig = require("../utils/loadConfig");
var reply = require("../utils/reply");
var validador = require("../utils/validador");

var path = require("path");
var fs = require("fs");

let reload = async (req, res) => {
    global.config = await loadConfig();

    let env = (process.env.ENV || global.config.app.NODE_ENV).trim();

    let confEnv = null;
    let urlEnv = path.resolve(__dirname, `../../env/${env}.js`);
    try {
        if (env === "local") fs.accessSync(urlEnv, fs.constants.R_OK);
    } catch (e) {}

    if (env === "local") {
        confEnv = {
            local: require(urlEnv),
            development: require(path.resolve(
                __dirname,
                `../../env/development.js`
            )),
        };
    } else {
        confEnv = require(urlEnv);
    }

    let out = {
        environment: env.toUpperCase(),
        before: {
            config: require(path.resolve(__dirname, `../../config.js`)),
            env: confEnv,
        },
        after: global.config,
    };

    res.json(reply.ok(env != "production" ? out : "done!"));
    // res.json(reply.ok(out));
};

let getFechaActual = async (request, response) => {
    try {
        let dataFecha = await invoker(
            global.config.serv_menu,
            "getFechaActual",
            null
        );

        response.json(reply.ok(dataFecha));
    } catch (e) {
        response.json(reply.fatal(e));
    }
};

let saveIdioma = async (request, response) => {
    try {
        let args = JSON.parse(
            request.body.arg === undefined ? "{}" : request.body.arg
        );
        let msg = validador.validarParametro(args, "cadena", "idioma", true);

        if (msg == "") {
            let dataDecrypt = await decryptToken(request.headers.authorization);

            let param = {
                login: dataDecrypt.uid,
                password: dataDecrypt.password,
                ldap: global.config.app.ldap,
                atributo: "idioma",
                valor: args.idioma.trim().toLowerCase(),
            };

            let data = await invoker(
                global.config.serv_ldap,
                "modifyAttribute",
                param
            );

            response.json(reply.ok());
        } else {
            response.json(reply.error(msg));
        }
    } catch (e) {
        response.json(reply.fatal(e));
    }
};

module.exports = {
    reload,
    getFechaActual,
    saveIdioma,
};
