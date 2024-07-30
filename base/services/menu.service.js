"use strict";

var invoker = require("../invokers/invoker.invoker");

var decryptToken = require("../utils/decryptToken");
var reply = require("../utils/reply");
var validador = require("../utils/validador");

var confApp = require('../../config').app;


let _buscaModuloToken = (dataDecrypt, codModulo) => {
    let moduloEncontrado = null;

    for (let i = 0; i < dataDecrypt.modulos.length; i++) {
        let unModulo = dataDecrypt.modulos[i];

        if (unModulo[0] == codModulo) {
            moduloEncontrado = {
                codModulo: unModulo[1],
            };

            break;
        }
    }

    return moduloEncontrado;
};

let _logicaAlumnosPregrado = async (dataUsuario, listModulos) => {
    let listCarreras = await invoker(
        global.config.serv_carreras,
        'pregrado/getCarrerasActualAlumno',
        { rut: dataUsuario.uid }
    );

    let codPrograma = 0;

    if (listCarreras.length > 0) {
        codPrograma = listCarreras[0].codPrograma;
    } else {
        throw reply.fatal(`No se encontró carrera para el alumnos.`).error;
    }

    let dataProcesoIns = await invoker(
        global.config.serv_procesosAcademicos,
        'inscripcionAsig/getProcesoInscripcionAsig',
        { cod_programa: codPrograma }
    );

    let agregaModulo = false;

    let listModulosFinal = [];

    for (let unModulo of dataUsuario.modulos) {
        for (let modulo of listModulos) {
            if (modulo.codModulo == unModulo[1]) {
                agregaModulo = false;

                if (unModulo[1] == global.config.param_portalAlumnos_modulo_inscripcion ||
                    unModulo[1] == global.config.param_portalAlumnos_modulo_modificacion ||
                    unModulo[1] == global.config.param_portalAlumnos_modulo_afg
                ) {
                    if (modulo.codModulo == global.config.param_portalAlumnos_modulo_inscripcion &&
                        dataProcesoIns.inscripcion_habilitado == 'SI') {
                        agregaModulo = true;
                    }
                    if (modulo.codModulo == global.config.param_portalAlumnos_modulo_modificacion &&
                        dataProcesoIns.modificacion_alumno_habilitado == 'SI') {
                        agregaModulo = true;
                    }
                    if (modulo.codModulo == global.config.param_portalAlumnos_modulo_afg &&
                        dataProcesoIns.afg_habilitado == 'SI') {
                        agregaModulo = true;
                    }
                } else {
                    agregaModulo = true;
                }

                if (agregaModulo) {
                    listModulosFinal.push({
                        id: unModulo[0],
                        nombre: modulo.nombre,
                        descripcion: modulo.descripcion,
                        estilo: modulo.estilo,
                        imagen: modulo.imagen,
                        moduloActivo: modulo.moduloActivo,
                        tipoMod: modulo.tipoMod,
                        grupo: modulo.grupo,
                        unionMod: modulo.unionMod,
                    });
                }

                break;
            }
        }
    }

    return listModulosFinal;
};


let getAplicaciones = async (request, response) => {
    try {
        let dataDecrypt = await decryptToken(request.headers.authorization);

        let listAplicaciones = await invoker(
            global.config.serv_menu,
            'getAplicaciones',
            null
        );

        let aplicaciones = [];

        for (let unaApp of dataDecrypt.aplicaciones) {
            for (let app of listAplicaciones) {
                if (
                    app.id == unaApp[1] &&
                    app.prefijo == unaApp[2]
                ) {
                    aplicaciones.push({
                        id: unaApp[0],
                        nombre: app.nombre,
                        imagen: app.imagen,
                        tipoApp: app.tipoApp,
                        grupoApp: app.grupoApp,
                    });

                    break;
                }
            }
        }

        response.json(reply.ok(aplicaciones));
    } catch (e) {
        response.json(reply.fatal(e));
    }
};

let getModulos = async (request, response) => {
    try {
        let dataDecrypt = await decryptToken(request.headers.authorization);

        let tipoPregrado = confApp.hasOwnProperty('tipoPregrado') ? confApp.tipoPregrado : false;

        let listModulosFinal = [];

        let paramModulo = {
            idProyecto: dataDecrypt.logeada.idProyecto,
            roles: dataDecrypt.logeada.rol,
        };

        let listModulos = await invoker(
            global.config.serv_menu,
            'getModulos',
            paramModulo
        );

        if (tipoPregrado && dataDecrypt.logeada.idProyecto == global.config.param_portalAlumnos_idProyecto) {
            listModulosFinal = await _logicaAlumnosPregrado(dataDecrypt, listModulos);
        } else {
            for (let unModulo of dataDecrypt.modulos) {
                for (let modulo of listModulos) {
                    if (modulo.codModulo == unModulo[1]) {
                        listModulosFinal.push({
                            id: unModulo[0],
                            nombre: modulo.nombre,
                            descripcion: modulo.descripcion,
                            estilo: modulo.estilo,
                            imagen: modulo.imagen,
                            moduloActivo: modulo.moduloActivo,
                            tipoMod: modulo.tipoMod,
                            grupo: modulo.grupo,
                            unionMod: modulo.unionMod,
                        });
                    }
                }
            }
        }

        response.json(reply.ok(listModulosFinal));
    } catch (e) {
        response.json(reply.fatal(e));
    }
};

let getMenus = async (request, response) => {
    try {
        let args = JSON.parse(
            request.body.arg === undefined ? "{}" : request.body.arg
        );
        let msg = validador.validarParametro(args, "cadena", "codModulo", true);

        if (msg == "") {
            let dataDecrypt = await decryptToken(request.headers.authorization);

            let moduloEncontrado = _buscaModuloToken(
                dataDecrypt,
                args.codModulo
            );

            if (moduloEncontrado != null) {
                let paramMenu = {
                    codModulo: moduloEncontrado.codModulo,
                    idProyecto: dataDecrypt.logeada.idProyecto,
                    rol: dataDecrypt.logeada.rol,
                };

                let menus = await invoker(
                    global.config.serv_menu,
                    "getMenus",
                    paramMenu
                );

                response.json(reply.ok(menus));
            } else {
                response.json(
                    reply.error(`Módulo '${args.codModulo}' no encontrado.`)
                );
            }
        } else {
            response.json(reply.error(msg));
        }
    } catch (e) {
        response.json(reply.fatal(e));
    }
};

let getAvisos = async (request, response) => {
    try {
        let avisos = [];

        let param = {
            login: global.config.app.codeAviso,
        };

        let listaAvisos = await invoker(
            global.config.serv_menu,
            "getAvisos",
            param
        );

        listaAvisos.forEach((aviso) => {
            if (aviso.activo == 1) {
                avisos.push(aviso);
            }
        });

        response.json(reply.ok(avisos));
    } catch (e) {
        response.json(reply.fatal(e));
    }
};

let getNoticias = async (request, response) => {
    try {
        let dataDecrypt = await decryptToken(request.headers.authorization);

        let param = {
            idProyecto: dataDecrypt.logeada.idProyecto,
        };

        let listNoticias = await invoker(
            global.config.serv_menu,
            "getNoticiasAplicacion",
            param
        );

        response.json(reply.ok(listNoticias));
    } catch (e) {
        response.json(reply.fatal(e));
    }
};

module.exports = {
    getAplicaciones,
    getModulos,
    getMenus,
    getAvisos,
    getNoticias,
};
