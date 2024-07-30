"use strict";

let vm = require('vm');

const invoker = require("../invokers/invoker.invoker");
const path = require("path");
const fileUtils = require("./fileUtils");
const commonUtils = require("./commonUtils");
const { name: appName } = require("../../package.json");

var loadServices = async (config) => {
    let services = {
        services: [
            {
                nameServ: "serv_url",
                serv: config.url,
            },
        ],
        error: [],
    };

    for (let i = 0; i < config.services.length; i++) {
        try {
            let unServer = await invoker(
                config.url,
                config.url.serviceName,
                config.services[i]
            );

            let serv = {
                nameServ: "serv_" + unServer.code,
                serv: {
                    host: unServer.host,
                    port: unServer.port,
                    path: unServer.path,
                },
            };

            services.services.push(serv);
        } catch (e) {
            services.error.push({
                nameServ: `serv_${config.services[i].name}`,
                error: e.message,
            });
        }
    }

    return services;
};

var loadLocalServices = (config) => {
    let services = [];

    for (let i = 0; i < config.localServices.length; i++) {
        let unServer = config.localServices[i];
        let serv = {
            nameServ: "serv_" + unServer.name,
            serv: {
                host: unServer.host,
                port: unServer.port,
                path: unServer.path,
            },
        };

        services.push(serv);
    }


    return services;
};

var setServices = async (preConfig, newConfig) => {
    let usaServices =
        (preConfig.services || []).length > 0 || (preConfig.localServices || []).length > 0;

    let servUrl = null;

    if (usaServices) {
        servUrl = {};
        servUrl.host = preConfig.url.host;
        servUrl.port = preConfig.url.port;
        servUrl.path = preConfig.url.path;
    }

    if (servUrl != null) {
        newConfig['serv_url'] = servUrl;

        let localServices = [];
        if ((preConfig.localServices || []).length) {
            localServices = loadLocalServices(preConfig);
    
            if (!preConfig.services) preConfig.services = [];
            localServices.forEach((localService) => {
                preConfig.services = preConfig.services.filter(
                    ({ name }) => `serv_${name}` !== localService.nameServ
                );
            });
        }

        let services = await loadServices(preConfig, servUrl);
        services.services = [...services.services, ...localServices];

        if (services.services.length > 0) {
            services.services.forEach((service) => {
                services.error =
                    services.error.filter((e) => e.nameServ !== service.nameServ) ||
                    [];
                newConfig[service.nameServ] = service.serv;
            });
        }
    
        if (services.error.length > 0) {
            services.error.map((e) =>
                logger.log(
                    `\x1b[36m[${appName}] \x1b[33m[ERROR SERVICES] ${e.error}\x1b[0m`
                )
            );
        }
    }

    return newConfig;
};

var loadParams = async (config) => {
    let usaParams = (config.params || []).length > 0;
    let parameters = {
        nameServ: "serv_param",
        serv: null,
        parameters: [],
        error: [],
    };

    if (usaParams) {
        let dataParam = await invoker(config.url, config.url.serviceName, {
            name: "param",
        });

        let nameServ = "serv_" + dataParam.code;

        let serv = {};
        serv.host = dataParam.host;
        serv.port = dataParam.port;
        serv.path = dataParam.path;

        parameters.nameServ = nameServ;
        parameters.serv = serv;

        for (let i = 0; i < config.params.length; i++) {
            try {
                let appParam = config.params[i];

                let parParams = {
                    app: appParam.app,
                    params: appParam.params,
                };

                let params = await invoker(serv, "getParams", parParams);

                for (let j = 0; j < params.length; j++) {
                    let nameParam =
                        "param_" + appParam.app + "_" + params[j].code;

                    let param = {
                        nameParam: nameParam,
                        value: params[j].value,
                    };

                    parameters.parameters.push(param);
                }
            } catch (e) {
                parameters.error.push({
                    nameParam: `param_${config.params[i].app}`,
                    error: e.message,
                });
            }
        }
    }

    return parameters;
};

var setParams = async (preConfig, newConfig) => {
    let parameters = await loadParams(preConfig);
    if (parameters.hasOwnProperty("nameServ")) {
        newConfig[parameters.nameServ] = parameters.serv;

        parameters.parameters.forEach((parameter) => {
            newConfig[parameter.nameParam] = parameter.value;
        });

        if (parameters.error.length > 0) {
            parameters.error.map((e) =>
                logger.log(
                    `\x1b[36m[${appName}] \x1b[33m[ERROR PARAMS] ${e.error}\x1b[0m`
                )
            );
        }
    }

    return newConfig;
};

let loadFunctions = async (config) => {
    let usaFunciones = (config.funciones || []).length > 0;
    let funciones = {
        nameServ: 'serv_funciones',
        serv: null,
        funciones: [],
        error: [],
    };

    if (usaFunciones) {
        let dataServ = await invoker(config.url, config.url.serviceName, {
            name: 'funciones'
        });

        let nameServ = 'serv_' + dataServ.code;

        let serv = {};
        serv.host = dataServ.host;
        serv.port = dataServ.port;
        serv.path = dataServ.path;

        funciones.nameServ = nameServ;
        funciones.serv = serv;

        for (let i = 0; i < config.funciones.length; i++) {
            try {
                let unaFuncion = await invoker(serv, 'getFuncion', config.funciones[i]);

                funciones.funciones.push({
                    code: config.funciones[i].name,
                    funcion: unaFuncion.funcion,
                    librerias: unaFuncion.librerias
                });

            } catch (e) {
                funciones.error.push({
                    funcion: config.funciones[i].name,
                    error: e.message,
                })
            }
        }
    }

    return funciones;
};

let setFunctions = async (preConfig, newConfig) => {
    let funciones = await loadFunctions(preConfig);
    if (funciones.hasOwnProperty('nameServ') && funciones.serv != null) {
        newConfig[funciones.nameServ] = funciones.serv;

        global.funciones = {};
        let context = {};

        funciones.funciones.forEach(unaFuncion => {
            if (unaFuncion.librerias.length > 0) {
                unaFuncion.librerias.forEach(unaLibreria => {
                    context[unaLibreria.name] = require(unaLibreria.name);
                });
            }
        });

        funciones.funciones.forEach(unaFuncion => {
            newConfig[unaFuncion.code] = unaFuncion.code;

            let miScript = new vm.Script(unaFuncion.funcion);

            vm.createContext(context);
            miScript.runInContext(context);
        });

        global.funciones  = context;

        if (funciones.error.length > 0) {
            funciones.error.map((e) =>
                logger.log(
                    `\x1b[36m[${appName}] \x1b[33m[ERROR FUNCTIONS] ${e.error}\x1b[0m`
                )
            );
        }
    }

    return newConfig;
};

var setEnvironment = async (env) => {
    let envParam = (env || "").trim();

    let localConfig;
    if (envParam === "") {
        let localPath = path.resolve(__dirname, `../../env/local.js`);
        if (fileUtils.fileCheck(localPath)) localConfig = require(localPath);

        envParam = "development"; //Por defecto
    }

    let envConfig = require(path.resolve(
        __dirname,
        `../../env/${envParam}.js`
    ));
    if (localConfig) envConfig = commonUtils.mergeDeep(envConfig, localConfig);

    let config = require("../../config");
    let preConfig = commonUtils.mergeDeep(
        commonUtils.mergeDeep({}, config),
        envConfig
    );
    preConfig.app.NODE_ENV = localConfig != null ? "local" : envParam;

    let newConfig = {
        app: preConfig.app,
    };

    return { newConfig: newConfig, preConfig: preConfig };
};

module.exports = async () => {
    var { preConfig, newConfig } = await setEnvironment(process.env.NODE_ENV);
    newConfig = await setServices(preConfig, newConfig);
    newConfig = await setParams(preConfig, newConfig);
    newConfig = await setFunctions(preConfig, newConfig);

    return newConfig;
};
