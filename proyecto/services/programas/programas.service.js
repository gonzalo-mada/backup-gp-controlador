'use strict';
var invoker = require('../../../base/invokers/invoker.invoker');
var reply = require('../../../base/utils/reply');
var validador = require('../../../base/utils/validador');
var decryptToken = require("../../../base/utils/decryptToken");
const reportInvoker = require("../../../base/invokers/report.invoker");
const { getNextCodigo, insertDocs, updateDocs, formatDateGp, insertLogPrograma, formatDateTimeGp } = require('../../utils/gpUtils')

let listProgramas = [];
let listProgramasNotMerged = [];
let listGradConjunta = [];
let listGradConjunta_prog = [];
const haveLogica = true;

const prog = {
    "s" : "programa",
    "get" : "getProgramas", //este es para programaS
    "get_programa" : "getPrograma",
    "insert" : "insertPrograma",
    "update" : "nombre s update",
    "delete" : "nombre s delete",
}

const log = {
    "s" : "programa",
    "get" : "getLogPrograma",
    "insert" : "insertLogPrograma"

}

const gradConjunta = {
    "s" : "graduacionConjunta",
    "get" : "getGraduacionConjunta",
    "insert" : "insertGraduacionConjunta",
    "update" : "nombre s update",
    "delete" : "nombre s delete",
}

const gradConjunta_prog = {
    "s" : "graduacionConjunta",
    "get" : "getGraduacionConjunta_Prog",
    "get_all" : "getGraduacionConjunta_Prog_All",
    "insert" : "insertGraduacionConjunta_Prog",
    "update" : "nombre s update",
    "delete" : "nombre s delete",
}

const campos_prog = {
    "Cod_Programa": "Cod_Programa",
    "Centro_costo": "Centro_costo",
    "Nombre_programa": "Nombre_programa",
    "Tipo_programa": "Tipo_programa",
    "Titulo": "Titulo",
    "Director": "Director",
    "Director_alterno": "Director_alterno",
    "REXE": "Rexe",
    "Codigo_SIES": "Codigo_SIES",
    "Cod_Reglamento": "Cod_Reglamento",
    "Cod_acreditacion": "Cod_acreditacion",
    "Creditos_totales": "Creditos_totales",
    "Horas_totales": "Horas_totales",
    "Grupo_correo": "Grupo_correo",
    "Cod_EstadoMaestro": "Cod_EstadoMaestro",
    "Campus": "Campus",
    "Unidad_academica": "Unidad_academica",
    "Grado_academico": "Grado_academico",
    "ID_TipoSuspension" : "ID_TipoSuspension",
    "Graduacion_Conjunta": "Graduacion_Conjunta"
};

const campos_gradConjunta = {
    "Cod_GraduacionConjunta": "Cod_GraduacionConjunta",
    "Cod_institucion": "Cod_institucion",
    "Descripcion_institucion": "Descripcion_institucion"
}

const campos_gradConjunta_prog = {
    "Cod_GraduacionConjunta_Programa": "Cod_GraduacionConjunta_Programa",
    "Cod_Programa": "Cod_Programa",
    "Cod_GraduacionConjunta": "Cod_GraduacionConjunta"
}

const campos_logPrograma = {
    "Cod_Programa": "Cod_Programa",
    "descripcion": "descripcion",
    "fecha": "fecha",
    "tipo_movimiento": "tipo_movimiento",
    "usuario": "usuario",
    "nombre_usuario" : "nombre_usuario",
    "correo_usuario" : "correo_usuario"
}

let getPrograma = async(req,res) => {
    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "numero", "Cod_Programa", true);

        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }

        let params = {
            [campos_prog.Cod_Programa] : args.Cod_Programa
        }

        let programa = {}; 

        if (haveLogica) {
            programa = await invoker(
                global.config.serv_basePostgrado,
                `${prog.s}/${prog.get_programa}`,
                params
            );
        }else{
            programa = listProgramasNotMerged.find( prog => prog[campos_prog.Cod_Programa] === args.Cod_Programa);
        }

        res.json(reply.ok(programa));
    } catch (e) {
        console.log("error getPrograma",e);
        res.json(reply.fatal(e));  
    }
}

let getProgramas = async (req,res) => {
    try {
        const token = req.headers.authorization;
        const dataDecrypt = await decryptToken(token);

        if (haveLogica) {
            listProgramas = await invoker(
                global.config.serv_basePostgrado,
                `${prog.s}/${prog.get}`,
                null
            );
        }
        let programasMapped = listProgramas.map( programa => {
            return {
                "Cod_Programa": programa.Cod_Programa,
                "Centro_costo": programa.Centro_costo,
                "Nombre_programa": programa.Nombre_programa,
                "Titulo": programa.Titulo,
                "Director": programa.Director,
                "Director_alterno": programa.Director_alterno,
                "Rexe": programa.Rexe,
                "Codigo_SIES": programa.Codigo_SIES,
                "Creditos_totales": programa.Creditos_totales,
                "Horas_totales": programa.Horas_totales,
                "Grupo_correo": programa.Grupo_correo,
                "Grado_academico": programa.Grado_academico,
                "Campus": programa.Campus.Descripcion_campus,
                "Estado_maestro": programa.Estado_maestro.Descripcion_EstadoMaestro,
                // "Suspension": programa.Suspension,
                "Reglamento": programa.Reglamento.Descripcion_reglamento,
                "Tipo_programa": programa.Tipo_programa,
                "Facultad": programa.Unidad_academica.Facultad.Descripcion_facu,
                "Unidad_academica": programa.Unidad_academica.Descripcion_ua,
                "Acreditacion" : {
                    "Cod_acreditacion" : programa.Acreditacion.Cod_acreditacion,
                    "Acreditado" : programa.Acreditacion.Acreditado,
                    "Certificado" : programa.Acreditacion.Certificado,
                    "Nombre_ag_acredit" : programa.Acreditacion.Nombre_ag_acredit,
                    "Nombre_ag_certif" : programa.Acreditacion.Nombre_ag_certif,
                    "Evaluacion_interna" : programa.Acreditacion.Evaluacion_interna,
                    "Fecha_informe" : formatDateGp(programa.Acreditacion.Fecha_informe),
                    "tiempo" : {
                        "Cod_tiempoacredit" : programa.Acreditacion.tiempo.Cod_tiempoacredit,
                        "Fecha_inicio" : formatDateGp(programa.Acreditacion.tiempo.Fecha_inicio),
                        "Fecha_termino" : formatDateGp(programa.Acreditacion.tiempo.Fecha_termino),
                        "Cantidad_anios" : programa.Acreditacion.tiempo.Cantidad_anios,
                    } 
                }
            }
        })
        res.json(reply.ok(programasMapped));
    } catch (e) {
        res.json(reply.fatal(e));
    }
};

let getGradConjunta = async (req,res) => {
    try {
        if (haveLogica) {
            listGradConjunta = await invoker(
                global.config.serv_basePostgrado,
                `${gradConjunta.s}/${gradConjunta.get}`,
                null
            );
        }
        res.json(reply.ok(listGradConjunta));
    } catch (e) {
        res.json(reply.fatal(e));
    }
};

let getDirector = async (req , res) => {
    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "numero", "rut", true);

        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }
        let params = {
            "rut": args.rut
        }

        let director = await invoker(
            global.config.serv_wsfincon,
            'rrhh/getDatosFuncionario',
            params
        );

        res.json(reply.ok(director));
    } catch (e) {
        console.log(e);
        res.json(reply.fatal(e));  
    }
}

let getInstituciones = async (req, res) => {
    try {
        let instituciones = await invoker(
            global.config.serv_conveniosFormulario,
            "ingreso/getInstituciones",
            {
                tipo_institucion: 0,
            }
        );

        for (let i in instituciones) {
            instituciones[i] = {
                idInstitucion: instituciones[i].id,
                nombreInstitucion: instituciones[i].nombre_institucion,
                tipoInstitucion: instituciones[i].tipo_institucion,
                esNacional: instituciones[i].es_nacional,
                estado: instituciones[i].estado,
            };
        }
        res.json(reply.ok(instituciones));
    } catch (e) {
        res.json(reply.fatal(e));
    }
}

let getInstitucionesSelected = async (req, res) => {
    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "numero", "Cod_Programa", true);

        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }

        let params = {
            [campos_prog.Cod_Programa] : args.Cod_Programa
        }

        if (haveLogica) {
            listGradConjunta_prog = await invoker(
                global.config.serv_basePostgrado,
                `${gradConjunta_prog.s}/${gradConjunta_prog.get}`,
                params
            );
            listGradConjunta = await invoker(
                global.config.serv_basePostgrado,
                `${gradConjunta.s}/${gradConjunta.get}`,
                null
            );
        }

        let listMerge =  listGradConjunta_prog.map( gc_p => {
            let gc = listGradConjunta.find( gc => gc[campos_gradConjunta.Cod_GraduacionConjunta] === gc_p[campos_gradConjunta_prog.Cod_GraduacionConjunta])
            return {
                Cod_institucion: gc?.Cod_institucion,
                Descripcion_institucion: gc?.Descripcion_institucion
            }
        })
        res.json(reply.ok(listMerge));

    } catch (error) {
        console.log("error getInstitucionesSelected",e);
        res.json(reply.fatal(e));  
    }
}

let insertPrograma = async (req, res) => {
    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        // console.log("args insert programa",args);
        let msg = validador.validarParametro(args, "numero", "Centro_costo", true);
        msg += validador.validarParametro(args, "cadena", "Nombre_programa", true);
        msg += validador.validarParametro(args, "numero", "Tipo_programa", true);
        msg += validador.validarParametro(args, "cadena", "Titulo", true);
        msg += validador.validarParametro(args, "cadena", "Grado_academico", true);
        msg += validador.validarParametro(args, "cadena", "Director_selected", true);
        msg += validador.validarParametro(args, "cadena", "DirectorAlterno_selected", true);
        msg += validador.validarParametro(args, "cadena", "REXE", true);
        // msg += validador.validarParametro(args, "numero", "Cod_Programa", false);
        msg += validador.validarParametro(args, "cadena", "Codigo_SIES", true);
        msg += validador.validarParametro(args, "numero", "Cod_Reglamento", true);
        msg += validador.validarParametro(args, "numero", "Cod_acreditacion", true);
        msg += validador.validarParametro(args, "numero", "Creditos_totales", true);
        msg += validador.validarParametro(args, "numero", "Horas_totales", true);
        msg += validador.validarParametro(args, "cadena", "Grupo_correo", true);
        msg += validador.validarParametro(args, "numero", "Cod_EstadoMaestro", true);
        msg += validador.validarParametro(args, "numero", "Campus", true);
        msg += validador.validarParametro(args, "numero", "Unidad_academica", true);
        msg += validador.validarParametro(args, "boolean", "Graduacion_Conjunta_Switch", true);

        // msg += validador.validarParametro(args, "lista", "Instituciones", true);
        // msg += validador.validarParametro(args, "lista", "docsToUpload", true);

        if (msg != "") {
            res.json(reply.error(msg));
            return;
        };

        let params = {
            [campos_prog.Centro_costo] : args.Centro_costo,
            [campos_prog.Nombre_programa] : args.Nombre_programa,
            [campos_prog.Tipo_programa] : args.Tipo_programa,
            [campos_prog.Titulo] : args.Titulo,
            [campos_prog.Grado_academico] : args.Grado_academico,
            [campos_prog.Director] : args.Director_selected,
            [campos_prog.Director_alterno] : args.DirectorAlterno_selected,
            [campos_prog.REXE] : args.REXE,
            // [campos_prog.Cod_Programa] : args.Cod_Programa,
            [campos_prog.Codigo_SIES] : args.Codigo_SIES,
            [campos_prog.Cod_Reglamento] : args.Cod_Reglamento,
            [campos_prog.Cod_acreditacion] : args.Cod_acreditacion,
            [campos_prog.Creditos_totales] : args.Creditos_totales,
            [campos_prog.Horas_totales] : args.Horas_totales,
            [campos_prog.Grupo_correo] : args.Grupo_correo,
            [campos_prog.Cod_EstadoMaestro] : args.Cod_EstadoMaestro,
            [campos_prog.Campus] : args.Campus,
            [campos_prog.Unidad_academica] : args.Unidad_academica,
            [campos_prog.Graduacion_Conjunta] : args.Graduacion_Conjunta_Switch ? 1 : 0,
            [campos_prog.ID_TipoSuspension] : 0
        }

        let insertPrograma;
        let codPrograma;
        if (haveLogica) {
            insertPrograma = await invoker (
                global.config.serv_basePostgrado,
                `${prog.s}/${prog.insert}`,
                params
            );
        }else{
            insertPrograma = listProgramas.push(params);
        }

        if (!insertPrograma) {
            res.json(reply.error(`El programa no pudo ser creado.`));
            return;
        }else{
            codPrograma = insertPrograma[0].Cod_Programa;
            try {
                if (args.Graduacion_Conjunta_Switch) {
                    // hay que insertar instituciones
                    
                    for (let i = 0; i < args.Instituciones.length; i++) {
                        const inst = args.Instituciones[i];
        
                        if (haveLogica) {
                            listGradConjunta = await invoker(
                                global.config.serv_basePostgrado,
                                `${gradConjunta.s}/${gradConjunta.get}`,
                                null
                            );
                        }

                        const institucionEncontrada  = listGradConjunta.find(item => item.Cod_institucion === inst.idInstitucion);
                        let codigo_gradConj;

                        if (institucionEncontrada ) {
                            // no se inserta en tabla
                            codigo_gradConj = institucionEncontrada.Cod_GraduacionConjunta;
                        } else {
                            // si se inserta
                            codigo_gradConj = getNextCodigo(listGradConjunta,campos_gradConjunta.Cod_GraduacionConjunta);
                            let params_gradConjunta = {
                                [campos_gradConjunta.Cod_GraduacionConjunta]: parseInt(codigo_gradConj),
                                [campos_gradConjunta.Cod_institucion]: inst.idInstitucion,
                                [campos_gradConjunta.Descripcion_institucion]: inst.nombreInstitucion,
                            }
                            if (haveLogica) {
                                await invoker (
                                    global.config.serv_basePostgrado,
                                    `${gradConjunta.s}/${gradConjunta.insert}`,
                                    params_gradConjunta
                                );
                            }else{
                                listGradConjunta.push(params_gradConjunta);
                            }


                        }

                        //inicio insert tabla graduacionconjunta_programa
                        if (haveLogica) {
                            listGradConjunta_prog = await invoker(
                                global.config.serv_basePostgrado,
                                `${gradConjunta_prog.s}/${gradConjunta_prog.get_all}`,
                                null
                            );
                        }
        
                        let codigo_gradConj_prog = getNextCodigo(listGradConjunta_prog,campos_gradConjunta_prog.Cod_GraduacionConjunta_Programa);
        
                        let params_gradConjunta_prog = {
                            [campos_gradConjunta_prog.Cod_GraduacionConjunta_Programa] : parseInt(codigo_gradConj_prog),
                            [campos_gradConjunta_prog.Cod_Programa] : codPrograma,
                            [campos_gradConjunta_prog.Cod_GraduacionConjunta] : parseInt(codigo_gradConj)
        
                        }
        
                        if (haveLogica) {
                            await invoker (
                                global.config.serv_basePostgrado,
                                `${gradConjunta_prog.s}/${gradConjunta_prog.insert}`,
                                params_gradConjunta_prog
                            );
                        }else{
                            listGradConjunta_prog.push(params_gradConjunta_prog);
                        }
                        //fin insert tabla graduacionconjunta_programa
                    }
                }
                for (let j = 0; j < args.docsToUpload.length; j++) {
                    const doc = args.docsToUpload[j];
                    let arrayDocs = [];
                    arrayDocs.push(doc)
                    switch (doc.from) {
                        case 'Maestro': 
                            await insertDocs({
                                arrayDocs: arrayDocs,
                                coleccion: 'maestro',
                                extrasKeyCode: 'CodPrograma',
                                extrasValueCode: codPrograma,
                                extrasKeyDescription: 'nombrePrograma',
                                extrasValueDescription: args.Nombre_programa
                            })
                        break;
                        case 'Título':
                            await insertDocs({
                                arrayDocs: arrayDocs,
                                coleccion: 'titulo',
                                extrasKeyCode: 'CodPrograma',
                                extrasValueCode: codPrograma,
                                extrasKeyDescription: 'nombreTitulo',
                                extrasValueDescription: args.Titulo
                            })
                        break;

                        case 'Grado académico':
                            await insertDocs({
                                arrayDocs: arrayDocs,
                                coleccion: 'grado_academico',
                                extrasKeyCode: 'CodPrograma',
                                extrasValueCode: codPrograma,
                                extrasKeyDescription: 'nombreGradoAcademico',
                                extrasValueDescription: args.Grado_academico
                            })
                        break;

                        case 'REXE':
                            await insertDocs({
                                arrayDocs: arrayDocs,
                                coleccion: 'REXE',
                                extrasKeyCode: 'CodPrograma',
                                extrasValueCode: codPrograma,
                                extrasKeyDescription: 'codigoREXE',
                                extrasValueDescription: args.REXE
                            })
                        break;

                        case 'Director':
                            await insertDocs({
                                arrayDocs: arrayDocs,
                                coleccion: 'director',
                                extrasKeyCode: 'CodPrograma',
                                extrasValueCode: codPrograma,
                                extrasKeyDescription: 'rutDirector',
                                extrasValueDescription: args.Director_selected
                            })
                        break;

                        case 'Director alterno':
                            await insertDocs({
                                arrayDocs: arrayDocs,
                                coleccion: 'directorAlterno',
                                extrasKeyCode: 'CodPrograma',
                                extrasValueCode: codPrograma,
                                extrasKeyDescription: 'rutDirectorAlterno',
                                extrasValueDescription: args.DirectorAlterno_selected
                            })
                        break;

                        case 'Estado maestro':
                            await insertDocs({
                                arrayDocs: arrayDocs,
                                coleccion: 'estado_maestro',
                                extrasKeyCode: 'CodPrograma',
                                extrasValueCode: codPrograma,
                                extrasKeyDescription: 'descripEstadoMaestro',
                                extrasValueDescription: args.EstadoMaestro.Descripcion_EstadoMaestro 
                            })
                        break;
                    }
                }
            } catch (error) {
                if (haveLogica) {
                    console.log("entre a este error");
                    //TODO: SPRINT 5. DELETE PROGRAMA
                    // await invoker(
                    //     global.config.serv_basePostgrado,
                    //     `${prog.s}/${prog.delete}`,
                    //     { [campos_prog.Cod_Programa] : args.Cod_Programa }
                    // );
                }else{
                    listProgramas = listProgramas.filter( prog => prog[campos_prog.Cod_Programa] != codPrograma)
                }
                throw error;
            }
        }
        let insertLog = await insertLogPrograma(req, codPrograma,'CREACIÓN DE PROGRAMA','C')
        let response = { dataWasInserted: insertPrograma , dataInserted: args.Nombre_programa}
        res.json(reply.ok(response));
    } catch (e) {
        res.json(reply.fatal(e));
    }
}

let getDocumentosWithBinary = async (req, res) => {
    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "numero","Cod_Programa", true);
        msg += validador.validarParametro(args, "cadena","from", true);

        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }

        let documentos = await invoker(
            global.config.serv_mongoDocumentos,
            "documentos/buscarDocumentos",
            {
                database: "gestionProgramas",
                coleccion: args.from,
                documento: {
                    "extras.CodPrograma": args.Cod_Programa
                },
            }
        );

        const docsWithBinary = await Promise.all(documentos.map(async (documento) => {
            //obtengo binario
            let binaryDocumento = await reportInvoker(
                global.config.serv_mongoDocumentos,
                "documentos/obtenerArchivoDocumento",
                {
                    database: "gestionProgramas",
                    coleccion: args.from,
                    id: documento.id
                }
            );
            
            //convierto binario a base64
            const dataBase64 = binaryDocumento.toString('base64');

            return {
                ...documento,
                dataBase64
            };
        }))
        res.json(reply.ok(docsWithBinary));
    } catch (e) {
        res.json(reply.fatal(e));
    }
}

let getLogPrograma = async (req, res) => {
    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "numero", "Cod_Programa", true);

        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }

        let params = {
            [campos_prog.Cod_Programa] : args.Cod_Programa
        }

        let logPrograma = await invoker(
            global.config.serv_basePostgrado,
            `${log.s}/${log.get}`,
            params
        );

        let logMapped = logPrograma.map( log => {
            return {
                "Cod_Programa": log.Cod_Programa,
                "descripcion": log.descripcion,
                "fecha": formatDateTimeGp(log.fecha),
                "tipo_movimiento": log.tipo_movimiento,
                "usuario": log.usuario,
                "nombre_usuario": log.nombre_usuario,
                "correo_usuario": log.correo_usuario
            }
        })

        res.json(reply.ok(logMapped));
    } catch (e) {
        console.log("error getLogPrograma",e);
        res.json(reply.fatal(e));  
    }
}

let getArchiveDoc = async (req, res) => {
    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "cadena", "id", true);
        msg += validador.validarParametro(args, "cadena","from", true);
 
        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }
 
        let archivo = await reportInvoker(
            global.config.serv_mongoDocumentos,
            "documentos/obtenerArchivoDocumento",
            {
                database: "gestionProgramas",
                coleccion: args.from,
                id: args.id,
            }
        );

        res.send(archivo);
    } catch (e) {
        res.json(reply.fatal(e));
    }
}

module.exports = {
    getDirector,
    getPrograma,
    getProgramas,
    getInstituciones,
    getInstitucionesSelected,
    getGradConjunta,
    insertPrograma,
    getDocumentosWithBinary,
    getLogPrograma,
    getArchiveDoc
}