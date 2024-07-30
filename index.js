"use strict";

var express = require("express");
var methodOverride = require("method-override");
var invoker = require("./base/invokers/invoker.invoker");
var logReg = require("./base/utils/loggerRegister");
var reply = require("./base/utils/reply");
var readToken = require("./base/utils/readToken");

global.logger = require("./base/utils/logConsola");

var loadConfig = require("./base/utils/loadConfig");
var infoApp = require("./package.json");
var confApp = require("./config").app;

var whitelist = [];

var app = express();

let setRequestLargeEntity = () => {
    app.use(
        express.urlencoded(
            confApp.largeEntity
                ? { extended: false, limit: "500mb" }
                : { extended: false }
        )
    );
    app.use(express.json(confApp.largeEntity ? { limit: "500mb" } : {}));
    app.use(methodOverride());
    logger.log(
        `\x1b[36m[${infoApp.name}]\x1b[0m Request entity: ${
            confApp.largeEntity ? "large" : "normal"
        }`
    );
};

let configCORS = () => {
    try {
        app.use(function (req, res, next) {
            let ip =
                req.headers["x-real-ip"] !== undefined
                    ? req.headers["x-real-ip"]
                    : "127.0.0.1";

            let esLocal = ip == "127.0.0.1" || req.headers.origin === undefined;
            let puedeResponder = whitelist.indexOf(ip) !== -1;
            let origen = puedeResponder
                ? !esLocal
                    ? req.headers.origin
                    : "*"
                : "";

            if (puedeResponder) {
                res.setHeader("Access-Control-Allow-Origin", origen);
                res.setHeader(
                    "Access-Control-Allow-Methods",
                    "POST, GET, OPTIONS, DELETE"
                );
                res.setHeader("Access-Control-Max-Age", "60");
                res.setHeader(
                    "Access-Control-Allow-Headers",
                    "Origin, X-Requested-With, Content-Type, Accept, Authorization, sentry-trace"
                );

                if (req.method === "OPTIONS") {
                    return res.status(200).end();
                }

                return next();
            } else {
                return res.json(
                    reply.error(
                        "This is CORS-enabled for a whitelisted domain."
                    )
                );
            }
        });
        logger.log(`\x1b[36m[${infoApp.name}]\x1b[0m CORS: listo`);
    } catch (e) {
        throw { msgs: "Error configurar permisos CORS", error: e };
    }
};

let setLogReg = () => {
    try {
        app.use(function (req, res, next) {
            logReg(res, next);
        });
        logger.log(`\x1b[36m[${infoApp.name}]\x1b[0m LogReg: listo`);
    } catch (e) {
        throw { msgs: "Error registrar LOG", error: e };
    }
};

let setTokenMiddleware = () => {
    try {
        /**
         * VALIDACION TOKEN
         *
         * Por cada llamada se verifica el token de seguridad.
         * Para desactivar: config.js cambiar "app.token" a "false"
         */
        app.use(function (req, res, next) {
            if (confApp.token) {
                let token = req.headers.authorization;

                if (token) {
                    readToken(token)
                        .then((dataToken) => {
                            next();
                        })
                        .catch((error) => {
                            error.message = "tokenError: " + error.message;
                            res.json(reply.fatal(error));
                        });
                } else {
                    res.json(reply.error("tokenError: no encontrado"));
                }
            } else {
                next();
            }
        });
        logger.log(`\x1b[36m[${infoApp.name}]\x1b[0m Token middleware: listo`);
    } catch (e) {
        throw { msgs: "Error cargar token middleware", error: e };
    }
};

let setConfig = async () => {
    try {
        global.config = await loadConfig();
        logger.log(`\x1b[36m[${infoApp.name}]\x1b[0m Config: listo`);
    } catch (e) {
        throw { msgs: "Error carga config/envConfig", error: e };
    }
};

let setRouters = (module) => {
    try {
        switch (module) {
            case "base":
                app.use(
                    `/${confApp.rootPath}/base`,
                    require("./base/routes/base.router")
                );
                break;
            case "proyecto":
                require("./routes")(app, confApp.rootPath);
                break;
        }
        logger.log(
            `\x1b[36m[${infoApp.name}]\x1b[0m Routers (${module}): listo`
        );
    } catch (e) {
        throw { msgs: `Error carga routers (${module})`, error: e };
    }
};

let getIpPermitidas = async () => {
    try {
        let listaIPs = await invoker(global.config.serv_param, "getAllParams", {
            app: "ips_permitidas",
        });
        for (let i = 0; i < listaIPs.length; i++) {
            whitelist.push(listaIPs[i].value);
        }
        logger.log(`\x1b[36m[${infoApp.name}]\x1b[0m IP's permitidas: listo`);
    } catch (e) {
        throw { msgs: "Error obtener IP permitidas", error: e };
    }
};

let launchApp = () => {
    try {
        app.listen(global.config.app.port, function () {
            let msgTipoPregrado = confApp.tipoPregrado  ? `PREGADO` : `NORMAL`;

            logger.log(
                `\x1b[36m[${
                    infoApp.name
                }]\x1b[0m Env: ${global.config.app.NODE_ENV.toUpperCase()}, Port: ${
                    global.config.app.port
                }, Path: /${confApp.rootPath}, Token: ${
                    confApp.token
                }, Tipo: CONTROLADOR ${
                    msgTipoPregrado
                }, v: ${
                    infoApp.version
                }`
            );
        });
    } catch (e) {
        throw { msgs: "Error lanzar app", error: e };
    }
};

let initApp = async () => {
    try {
        setRequestLargeEntity();
        configCORS();
        await setConfig();
        await getIpPermitidas();
        setRouters("base");
        setLogReg();
        setTokenMiddleware();
        setRouters("proyecto");
        launchApp();
    } catch (e) {
        logger.log(
            `\x1b[36m[${infoApp.name}] \x1b[33m[${e.msgs}] ${e.error}\x1b[0m`
        );
    }
};

initApp();

module.exports = app;
