'use strict';
var invoker = require('../../base/invokers/invoker.invoker');
var reply = require('../../base/utils/reply');
var validador = require('../../base/utils/validador');
var decryptToken = require("../../base/utils/decryptToken");
const { logica_getCampus } = require('./campus.service')

let listProgramas = [];
const haveLogica = false;
const prog = {
    "s" : "ACA NOMBRE SERVICIO",
    "get" : "nombre s get",
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
        "Codigo_FlN700": 124125,
        "Grado_academico": "1801"
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
        "Codigo_FlN700": 124125,
        "Grado_academico": "1801"
    }
];

const campos_prog = {
    "Cod_Programa": "Cod_Programa",
    "Centro_costo": "Centro_costo",
    "Nombre_programa": "Nombre_programa",
    "Tipo_programa": "Tipo_programa",
    "Titulo": "Titulo",
    "Director": "Director",
    "Director_alterno": "Director_alterno",
    "Rexe": "Rexe",
    "Codigo_SlES": "Codigo_SlES",
    "ID_Reglamento": "ID_Reglamento",
    "Cod_acreditacion": "Cod_acreditacion",
    "Creditos_totales": "Creditos_totales",
    "Horas_totales": "Horas_totales",
    "Grupo_correo": "Grupo_correo",
    "Estado_maestro": "Estado_maestro",
    "Campus": "Campus",
    "Unidad_academica": "Unidad_academica",
    "Codigo_FlN700": "Codigo_FlN700",
    "Grado_academico": "Grado_academico"
};

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
}

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
        
        // res.json(reply.fatal(e));  
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

module.exports = {
    getDirector,
    getProgramas,
    getInstituciones
}