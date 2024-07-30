"use strict";

const { v4: uuidV4 } = require('uuid');

var invoker = require("../invokers/invoker.invoker");

var decryptToken = require("../utils/decryptToken");
var reply = require("../utils/reply");
var validador = require("../utils/validador");

var shared = require("./shared");

let _buscaProyectoToken = (proyecto, dataDecrypt) => {
    let appSeleccionada = null;

    if (dataDecrypt.hasOwnProperty("logeada")) {
        if (dataDecrypt.logeada.id == proyecto) {
            appSeleccionada = dataDecrypt.logeada;
        }
    }

    return appSeleccionada;
};

let _buscaModuloToken = (modulo, dataDecrypt) => {
    let modSeleccionado = null;

    for (let i = 0; i < dataDecrypt.modulos.length; i++) {
        let unModulo = dataDecrypt.modulos[i];

        if (unModulo[0] == modulo) {
            modSeleccionado = {
                id: unModulo[0],
                codModulo: unModulo[1],
            };
            break;
        }
    }

    return modSeleccionado;
};

let _creaDataUrlModulo = async (dataUser, url_base, proyecto, modulo) => {
    let paramCrypter = [];
    paramCrypter.push({ code: "u", value: dataUser.uid });
    paramCrypter.push({ code: "p", value: dataUser.password });
    paramCrypter.push({ code: "r", value: dataUser.rut });
    paramCrypter.push({ code: "n", value: dataUser.nombres });
    paramCrypter.push({ code: "a", value: dataUser.apellidos });
    paramCrypter.push({ code: "f", value: dataUser.nombreCompleto });
    paramCrypter.push({ code: "d", value: dataUser.fechaFinPassword });
    paramCrypter.push({ code: "i", value: dataUser.correouv });
    paramCrypter.push({ code: "m", value: dataUser.mail });
    paramCrypter.push({
        code: "c",
        value: new Date().getTime() + parseInt(24 * 60 * 1000),
    });

    if (proyecto != null) {
        paramCrypter.push({ code: "s", value: proyecto.idProyecto });
        paramCrypter.push({ code: "z", value: proyecto.prefijo });
    }

    if (modulo != null) {
        paramCrypter.push({ code: "o", value: modulo.codModulo });
    }

    let urlFinal = "?";

    for (let i = 0; i < paramCrypter.length; i++) {
        let datoV4 = await invoker(global.config.serv_crypterJava, "encrypt", {
            arg: paramCrypter[i].value,
            version: 4,
        });

        urlFinal += paramCrypter[i].code + "=" + datoV4.Version4 + "&";
    }

    return url_base + urlFinal.substring(0, urlFinal.length - 1);
};

let _generaUrl = async (token, dataDecrypt, proyecto, modulo) => {
    let appSelecionada = _buscaProyectoToken(proyecto, dataDecrypt);

    if (appSelecionada != null) {
        let modSeleccionado = _buscaModuloToken(modulo, dataDecrypt);

        if (modSeleccionado != null) {
            let paramMod = {
                idProyecto: parseInt(appSelecionada.idProyecto),
                codModulo: parseInt(modSeleccionado.codModulo),
            };

            let dataMod = await invoker(
                global.config.serv_menu,
                "getModulo",
                paramMod
            );

            let urlFinal = dataMod.url;
            if (urlFinal.lastIndexOf("/") + 1 == urlFinal.length) {
                urlFinal = urlFinal.substring(0, urlFinal.length - 1);
            }

            let url = {
                url: "",
            };

            if (dataMod.tipoMod == "JAVA") {
                let urlJava = await _creaDataUrlModulo(
                    dataDecrypt,
                    urlFinal,
                    appSelecionada,
                    modSeleccionado
                );

                url.url = urlJava;
            } else if (dataMod.tipoMod == "ASP") {
                let paramKey = {
                    proyecto: appSelecionada.id,
                    modulo: modSeleccionado.id,
                    token: token,
                };

                let idSesion = await shared.setKey(dataDecrypt.uid, paramKey);

                url.url =
                    urlFinal +
                    "?usuario=" +
                    dataDecrypt.uid +
                    "&uid=" +
                    idSesion.id;
            } else {
                let paramKey = {
                    proyecto: appSelecionada.id,
                    modulo: modSeleccionado.id,
                    token: token,
                };

                let idSesion = await shared.setKey(dataDecrypt.uid, paramKey);

                url.url = urlFinal + "?uid=" + idSesion.id;
            }

            return url;
        } else {
            throw reply.fatal("No tiene permisos para ejecutar el módulo.")
                .error;
        }
    } else {
        throw reply.fatal("No tiene permisos para ejecutar la aplicación.")
            .error;
    }
};

let _buscarOtraAplicacion = (proyecto, dataDecrypt) => {
    let appEncontrada = null;

    for (let i = 0; i < dataDecrypt.aplicaciones.length; i++) {
        let unaAplicacion = dataDecrypt.aplicaciones[i];

        if (proyecto == unaAplicacion[0]) {
            appEncontrada = {
                id: unaAplicacion[0],
                idProyecto: unaAplicacion[1],
                prefijo: unaAplicacion[2],
                rol: unaAplicacion[3],
            };

            break;
        }
    }

    return appEncontrada;
};

let _getModulos = async (idProyecto, roles) => {
    let paramModulo = {
        idProyecto: idProyecto,
        roles: roles,
    };

    let listModulos = await invoker(
        global.config.serv_menu,
        "getModulos",
        paramModulo
    );

    let modulos = [];

    for (let i = 0; i < listModulos.length; i++) {
        let unModulo = listModulos[i];

        modulos.push([uuidV4().split("-").join(""), unModulo.codModulo]);
    }

    return modulos;
};

let _buscarAplicacion = (proyecto, dataDecrypt) => {
    let appEncontrada = null;

    for (let i = 0; i < dataDecrypt.aplicaciones.length; i++) {
        let unaAplicacion = dataDecrypt.aplicaciones[i];

        if (proyecto == unaAplicacion[0]) {
            appEncontrada = {
                id: unaAplicacion[0],
                idProyecto: unaAplicacion[1],
                prefijo: unaAplicacion[2],
                rol: unaAplicacion[3],
            };

            break;
        }
    }

    return appEncontrada;
};

let _getUrlAplicacion = async (
    appEncontrada,
    dataDecrypt,
    debeGenerarToken,
    token
) => {
    let urlFinal = "";

    let paramApp = {
        idProyecto: appEncontrada.idProyecto,
        prefijo: appEncontrada.prefijo,
    };

    let dataAplicacion = await invoker(
        global.config.serv_menu,
        "getAplicacion",
        paramApp
    );

    urlFinal = dataAplicacion.url;

    if (dataAplicacion.tipoApp == "JAVA") {
        let dataUrlProy = await _creaDataUrlModulo(
            dataDecrypt,
            urlFinal,
            paramApp,
            null
        );

        urlFinal = dataUrlProy;
    } else {
        if (debeGenerarToken) {
            let dataTokenNuevo = dataDecrypt;
            dataTokenNuevo.logeada = appEncontrada;

            let listModulos = await _getModulos(
                appEncontrada.idProyecto,
                appEncontrada.rol
            );

            dataTokenNuevo.modulos = listModulos;

            let paramToken = {
                dataToken: dataTokenNuevo,
            };

            let tokenNuevo = await invoker(
                global.config.serv_login,
                "generarToken",
                paramToken
            );

            let paramKey = {
                proyecto: appEncontrada.id,
                modulo: "SM",
                token: tokenNuevo,
            };

            let idSesion = await shared.setKey(dataDecrypt.uid, paramKey);

            if (dataAplicacion.tipoApp == "ASP") {
                urlFinal =
                    urlFinal +
                    "?usuario=" +
                    dataDecrypt.uid +
                    "&uid=" +
                    idSesion.id;
            } else {
                urlFinal = urlFinal + "?uid=" + idSesion.id;
            }
        } else {
            let paramKey = {
                proyecto: appEncontrada.id,
                modulo: "SM",
                token: token,
            };

            let idSesion = await shared.setKey(dataDecrypt.uid, paramKey);

            if (dataAplicacion.tipoApp == "ASP") {
                urlFinal =
                    urlFinal +
                    "?usuario=" +
                    dataDecrypt.uid +
                    "&uid=" +
                    idSesion.id;
            } else {
                urlFinal = urlFinal + "?uid=" + idSesion.id;
            }
        }
    }

    return urlFinal;
};

let navigate = async (request, response) => {
    try {
        let args = JSON.parse(
            request.body.arg === undefined ? "{}" : request.body.arg
        );
        let msg = validador.validarParametro(args, "cadena", "proyecto", true);
        msg += validador.validarParametro(args, "cadena", "modulo", true);
        let token = request.headers.authorization;

        if (msg == "") {
            let dataDecrypt = await decryptToken(token);

            let dataUrl = await _generaUrl(
                token,
                dataDecrypt,
                args.proyecto,
                args.modulo
            );

            response.json(reply.ok(dataUrl));
        } else {
            response.json(reply.error(msg));
        }
    } catch (e) {
        response.json(reply.fatal(e));
    }
};

let navigateApp = async (request, response) => {
    try {
        let args = JSON.parse(
            request.body.arg === undefined ? "{}" : request.body.arg
        );
        let msg = validador.validarParametro(args, "cadena", "proyecto", true);

        if (msg == "") {
            let dataDecrypt = await decryptToken(request.headers.authorization);

            let appEncontrada = _buscarOtraAplicacion(
                args.proyecto,
                dataDecrypt
            );

            if (appEncontrada != null) {
                let dataUrl = await _getUrlAplicacion(
                    appEncontrada,
                    dataDecrypt,
                    true,
                    null
                );

                response.json(reply.ok({ url: dataUrl }));
            } else {
                response.json(
                    reply.error(
                        `No se encontró el proyecto '${args.proyecto}'.`
                    )
                );
            }
        } else {
            response.json(reply.error(msg));
        }
    } catch (e) {
        response.json(reply.fatal(e));
    }
};

let getAppUrl = async (request, response) => {
    try {
        let args = JSON.parse(
            request.body.arg === undefined ? "{}" : request.body.arg
        );
        let msg = validador.validarParametro(args, "cadena", "proyecto", true);
        let token = request.headers.authorization;

        if (msg == "") {
            let dataDecrypt = await decryptToken(token);

            let appEncontrada = _buscarAplicacion(args.proyecto, dataDecrypt);

            if (appEncontrada != null) {
                let dataUrl = await _getUrlAplicacion(
                    appEncontrada,
                    dataDecrypt,
                    false,
                    token
                );

                response.json(reply.ok({ url: dataUrl }));
            } else {
                response.json(
                    reply.error(
                        `No se encontró el proyecto '${args.proyecto}'.`
                    )
                );
            }
        } else {
            response.json(reply.error(msg));
        }
    } catch (e) {
        response.json(reply.fatal(e));
    }
};

module.exports = {
    navigate,
    navigateApp,
    getAppUrl,
};
