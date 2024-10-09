'use strict';
var invoker = require('../../base/invokers/invoker.invoker');
var reply = require('../../base/utils/reply');
var validador = require('../../base/utils/validador');
var decryptToken = require("../../base/utils/decryptToken");
const reportInvoker = require("../../base/invokers/report.invoker");
const { getNextCodigo, insertDocs, updateDocs } = require('../utils/gpUtils')

let listProgramas = [];
let listGradConjunta = [];
let listGradConjunta_prog = [];
const haveLogica = false;

const prog = {
    "s" : "ACA NOMBRE SERVICIO",
    "get" : "nombre s get", //este es para programaS
    "get_programa" : "nombre s get",
    "insert" : "nombre s insert",
    "update" : "nombre s update",
    "delete" : "nombre s delete",
}

const gradConjunta = {
    "s" : "ACA NOMBRE SERVICIO",
    "get" : "nombre s get",
    "insert" : "nombre s insert",
    "update" : "nombre s update",
    "delete" : "nombre s delete",
}

const gradConjunta_prog = {
    "s" : "ACA NOMBRE SERVICIO",
    "get" : "nombre s get",
    "get_gc_p" : "nombre s get",
    "insert" : "nombre s insert",
    "update" : "nombre s update",
    "delete" : "nombre s delete",
}

listProgramas = [
    {
        "Cod_Programa": 1,
        "Centro_costo": "ej cen costo",
        "Nombre_programa": "DIPLOMA DE POSTÍTULO GESTIÓN EN SALUD",
        "Tipo_programa": {
            "Cod_tipoPrograma": 4,
            "Descripcion_tp": "DIPLOMAS ACADEMICOS",
            "Categoria": {
                "Cod_CategoriaTP": 2,
                "Descripcion_categoria": "POSTITULO"
            }
        },
        "Titulo": "DIPLOMADO EN GESTIÓN DE SALUD",
        "Director": "19083959",
        "Director_alterno": "19083959",
        "Rexe": "RE194812",
        "Codigo_SIES": "CO123124",
        "ID_Reglamento": 1,
        "Acreditacion": {
            "Cod_acreditacion": 1,
            "Acreditado": "SI",
            "Certificado": "NO",
            "Nombre_ag_acredit": "AGENCIAPRO",
            "Nombre_ag_certif": "N/A",
            "Evaluacion_interna": "SI",
            "Fecha_informe": "06-09-2024",
            "tiempo": {
                "Cod_tiempoacredit": 1,
                "Fecha_inicio": "06-09-2024",
                "Fecha_termino": "06-09-2026",
                "Cantidad_anios": 2
            }
        },
        "Creditos_totales": 50,
        "Horas_totales": 65,
        "Grupo_correo": "grupo.correo@uv.cl",
        "Estado_maestro": {
            "Cod_EstadoMaestro": 3,
            "Descripcion_EstadoMaestro": "SUSPENSIÓN"
        },
        "Suspension": {
            "ID_TipoSuspension": 1,
            "Descripcion_TipoSuspension": "Temporal",
        },
        "Campus":{
            "Cod_campus": 1,
            "Descripcion_campus": "CASA CENTRAL",
            "Estado_campus": true
        },
        "Unidad_academica": {
            "Cod_unidad_academica": 2,
            "Descripcion_ua": "Escuela de Ingeniería Civil en Informática",
            "Facultad": {
                "Cod_facultad": 11,
                "Descrpcion_facu": "INGENIERÍA",
                "Estado": 1
            } 
        },
        "Grado_academico": "LICENCIADO EN GESTIÓN DE SALUD",
        "Graduacion_conjunta": {
            "Cod_graduacionconjunta_programa": 1,
            "Instituciones":[
                {
                    "Cod_institucion": 1087,
                    "Detalle_institucion": "Pontificia Universidad Católica del Perú"
                },
                {
                    "Cod_institucion": 1089,
                    "Detalle_institucion": "Pontificia Universidad Católica de Chile"
                },
                {
                    "Cod_institucion": 1114,
                    "Detalle_institucion": "Universidad Arturo Prat"
                },
            ] 
        }
    },
    {
        "Cod_Programa": 2,
        "Centro_costo": "ej cen costo",
        "Nombre_programa": "DIPLOMA DE POSTÍTULO GESTIÓN EN SALUD",
        "Tipo_programa": {
            "Cod_tipoPrograma": 4,
            "Descripcion_tp": "DIPLOMAS ACADEMICOS",
            "Categoria": {
                "Cod_CategoriaTP": 2,
                "Descripcion_categoria": "POSTITULO"
            }
        },
        "Titulo": "DIPLOMADO EN GESTIÓN DE SALUD",
        "Director": "19083959",
        "Director_alterno": "19083959",
        "Rexe": "RE194812",
        "Codigo_SlES": "CO123124",
        "ID_Reglamento": 1,
        "Acreditacion": {
            "Cod_acreditacion": 1,
            "Acreditado": "SI",
            "Certificado": "NO",
            "Nombre_ag_acredit": "AGENCIAPRO",
            "Nombre_ag_certif": "N/A",
            "Evaluacion_interna": "SI",
            "Fecha_informe": "06-09-2024",
            "tiempo": {
                "Cod_tiempoacredit": 1,
                "Fecha_inicio": "06-09-2024",
                "Fecha_termino": "06-09-2026",
                "Cantidad_anios": 2
            }
        },
        "Creditos_totales": 50,
        "Horas_totales": 65,
        "Grupo_correo": "grupo.correo@uv.cl",
        "Estado_maestro": {
            "Cod_EstadoMaestro": 3,
            "Descripcion_EstadoMaestro": "SUSPENSIÓN"
        },
        "Suspension": {
            "ID_TipoSuspension": 1,
            "Descripcion_TipoSuspension": "Temporal",
        },
        "Campus":{
            "Cod_campus": 1,
            "Descripcion_campus": "CASA CENTRAL",
            "Estado_campus": true
        },
        "Unidad_academica": {
            "Cod_unidad_academica": 2,
            "Descripcion_ua": "Escuela de Ingeniería Civil en Informática",
            "Facultad": {
                "Cod_facultad": 11,
                "Descrpcion_facu": "INGENIERÍA",
                "Estado": 1
            } 
        },
        "Grado_academico": "1801"
    },
    {
        "Centro_costo": 12,
        "Nombre_programa": "Ea eaque laboris blanditiis et sunt duis ut laboriosam cillum aut reprehenderit",
        "Tipo_programa": 2,
        "Titulo": "Excepteur nobis libero consequat Praesentium dese",
        "Grado_academico": "Eum porro et itaque ut iure veritatis voluptatem f",
        "Director": "15078849-8",
        "Director_alterno": "15078849-8",
        "REXE": "Eu exercitationem corrupti aliquip molestiae aspe",
        "Cod_Programa": 95,
        "Codigo_SIES": "Distinctio Aliquip amet error eum ipsam delectus",
        "Cod_Reglamento": 2,
        "Cod_acreditacion": 2,
        "Creditos_totales": 10,
        "Horas_totales": 91,
        "Grupo_correo": "Blanditiis aliquid voluptas ea et tempore debitis nihil",
        "Cod_EstadoMaestro": 0,
        "Campus": 1,
        "Unidad_academica": 2,
        "Graduacion_Conjunta": 1
    }
    
];

listGradConjunta = [
    {
        "Cod_GraduacionConjunta": 1,
        "Cod_institucion": 901,
        "Descripcion_institucion": " Agropolis International"
    },
    {
        "Cod_GraduacionConjunta": 2,
        "Cod_institucion": 1350,
        "Descripcion_institucion": " Agencia de Cooperación Internacional del Japón"
    },
    {
        "Cod_GraduacionConjunta": 3,
        "Cod_institucion": 902,
        "Descripcion_institucion": " Air Liquide Chile"
    }
];

listGradConjunta_prog = [
    {
        "Cod_GraduacionConjunta_Programa": 1,
        "Cod_Programa": 95,
        "Cod_GraduacionConjunta": 1
    },
    {
        "Cod_GraduacionConjunta_Programa": 2,
        "Cod_Programa": 95,
        "Cod_GraduacionConjunta": 2
    },
    {
        "Cod_GraduacionConjunta_Programa": 3,
        "Cod_Programa": 95,
        "Cod_GraduacionConjunta": 3
    },
    {
        "Cod_GraduacionConjunta_Programa": 1,
        "Cod_Programa": 95,
        "Cod_GraduacionConjunta": 1
    },
    {
        "Cod_GraduacionConjunta_Programa": 2,
        "Cod_Programa": 95,
        "Cod_GraduacionConjunta": 2
    },
    {
        "Cod_GraduacionConjunta_Programa": 3,
        "Cod_Programa": 95,
        "Cod_GraduacionConjunta": 3
    }
]

const campos_prog = {
    "Cod_Programa": "Cod_Programa",
    "Centro_costo": "Centro_costo",
    "Nombre_programa": "Nombre_programa",
    "Tipo_programa": "Tipo_programa",
    "Titulo": "Titulo",
    "Director": "Director",
    "Director_alterno": "Director_alterno",
    "REXE": "REXE",
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
            programa = listProgramas.find( prog => prog[campos_prog.Cod_Programa] === args.Cod_Programa);
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
        res.json(reply.ok(listProgramas));
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

let getGradConjunta_Prog = async (req,res) => {
    try {
        if (haveLogica) {
            listGradConjunta_prog = await invoker(
                global.config.serv_basePostgrado,
                `${gradConjunta_prog.s}/${gradConjunta_prog.get}`,
                null
            );
        }
        res.json(reply.ok(listGradConjunta_prog));
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
                `${gradConjunta_prog.s}/${gradConjunta_prog.get_gc_p}`,
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
        msg += validador.validarParametro(args, "numero", "Cod_Programa", true);
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

        if (haveLogica) {
            listProgramas = await invoker(
                global.config.serv_basePostgrado,
                `${prog.s}/${prog.get}`,
                null
            );
        }

        if (args.Graduacion_Conjunta_Switch) {
            // hay que insertar instituciones
            
            for (let i = 0; i < args.Instituciones.length; i++) {
                const inst = args.Instituciones[i];

                //inicio insert tabla graduacionconjunta
                if (haveLogica) {
                    listGradConjunta = await invoker(
                        global.config.serv_basePostgrado,
                        `${gradConjunta.s}/${gradConjunta.get}`,
                        null
                    );
                }

                let codigo_gradConj = getNextCodigo(listGradConjunta,campos_gradConjunta.Cod_GraduacionConjunta);
                
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
                //fin insert tabla graduacion conjunta

                //inicio insert tabla graduacionconjunta_programa
                if (haveLogica) {
                    listGradConjunta_prog = await invoker(
                        global.config.serv_basePostgrado,
                        `${gradConjunta_prog.s}/${gradConjunta_prog.get}`,
                        null
                    );
                }

                let codigo_gradConj_prog = getNextCodigo(listGradConjunta_prog,campos_gradConjunta_prog.Cod_GraduacionConjunta_Programa);

                let params_gradConjunta_prog = {
                    [campos_gradConjunta_prog.Cod_GraduacionConjunta_Programa] : parseInt(codigo_gradConj_prog),
                    [campos_gradConjunta_prog.Cod_Programa] : args.Cod_Programa,
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

        let params = {
            [campos_prog.Centro_costo] : args.Centro_costo,
            [campos_prog.Nombre_programa] : args.Nombre_programa,
            [campos_prog.Tipo_programa] : args.Tipo_programa,
            [campos_prog.Titulo] : args.Titulo,
            [campos_prog.Grado_academico] : args.Grado_academico,
            [campos_prog.Director] : args.Director_selected,
            [campos_prog.Director_alterno] : args.DirectorAlterno_selected,
            [campos_prog.REXE] : args.REXE,
            [campos_prog.Cod_Programa] : args.Cod_Programa,
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
        }

        let insertPrograma;

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
            try {
                for (let j = 0; j < args.docsToUpload.length; j++) {
                    const doc = args.docsToUpload[j];
                    let arrayDocs = [];
                    arrayDocs.push(doc)
                    switch (doc.from) {
                        case 'Título':
                            await insertDocs({
                                arrayDocs: arrayDocs,
                                coleccion: 'titulo',
                                extrasKeyCode: 'CodPrograma',
                                extrasValueCode: args.Cod_Programa,
                                extrasKeyDescription: 'nombreTitulo',
                                extrasValueDescription: args.Titulo
                            })
                        break;

                        case 'Grado académico':
                            await insertDocs({
                                arrayDocs: arrayDocs,
                                coleccion: 'grado_academico',
                                extrasKeyCode: 'CodPrograma',
                                extrasValueCode: args.Cod_Programa,
                                extrasKeyDescription: 'nombreGradoAcademico',
                                extrasValueDescription: args.Grado_academico
                            })
                        break;

                        case 'REXE':
                            await insertDocs({
                                arrayDocs: arrayDocs,
                                coleccion: 'REXE',
                                extrasKeyCode: 'CodPrograma',
                                extrasValueCode: args.Cod_Programa,
                                extrasKeyDescription: 'codigoREXE',
                                extrasValueDescription: args.REXE
                            })
                        break;

                        case 'Director':
                            await insertDocs({
                                arrayDocs: arrayDocs,
                                coleccion: 'director',
                                extrasKeyCode: 'CodPrograma',
                                extrasValueCode: args.Cod_Programa,
                                extrasKeyDescription: 'rutDirector',
                                extrasValueDescription: args.Director_selected
                            })
                        break;

                        case 'Director alterno':
                            await insertDocs({
                                arrayDocs: arrayDocs,
                                coleccion: 'directorAlterno',
                                extrasKeyCode: 'CodPrograma',
                                extrasValueCode: args.Cod_Programa,
                                extrasKeyDescription: 'rutDirectorAlterno',
                                extrasValueDescription: args.DirectorAlterno_selected
                            })
                        break;

                        case 'Estado maestro':
                            await insertDocs({
                                arrayDocs: arrayDocs,
                                coleccion: 'estado_maestro',
                                extrasKeyCode: 'CodPrograma',
                                extrasValueCode: args.Cod_Programa,
                                extrasKeyDescription: 'descripEstadoMaestro',
                                extrasValueDescription: args.EstadoMaestro.Descripcion_EstadoMaestro 
                            })
                        break;
                    }
                }
            } catch (error) {
                if (haveLogica) {
                    await invoker(
                        global.config.serv_basePostgrado,
                        `${prog.s}/${prog.delete}`,
                        { [campos_prog.Cod_Programa] : args.Cod_Programa }
                    );
                }else{
                    listProgramas = listProgramas.filter( prog => prog[campos_prog.Cod_Programa] != args.Cod_Programa)
                }
                throw error;
            }
        }
        
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
module.exports = {
    getDirector,
    getPrograma,
    getProgramas,
    getInstituciones,
    getInstitucionesSelected,
    getGradConjunta,
    getGradConjunta_Prog,
    insertPrograma,
    getDocumentosWithBinary
}