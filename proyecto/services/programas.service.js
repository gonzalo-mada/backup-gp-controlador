'use strict';
var invoker = require('../../base/invokers/invoker.invoker');
var reply = require('../../base/utils/reply');
var validador = require('../../base/utils/validador');
var decryptToken = require("../../base/utils/decryptToken");
const reportInvoker = require("../../base/invokers/report.invoker");
const { getNextCodigo, insertDocs, updateDocs, formatDateGp, insertLogPrograma, formatDateTimeGp } = require('../utils/gpUtils')

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

listProgramas = [
    {
        "Cod_Programa": 1340,
        "Centro_costo": "318142013",
        "Nombre_programa": "MAGISTER EN GERONTOLOGÍA SOCIAL",
        "Titulo": "Titulo",
        "Director": "15078849-8",
        "Director_alterno": "15078849-8",
        "Rexe": "1057",
        "Codigo_SIES": "CODSIES",
        "Creditos_totales": 0,
        "Horas_totales": 0,
        "Grupo_correo": "GrupCorreo",
        "Grado_academico": "GRADOACADEMICO",
        "Campus": {
            "Cod_Campus": 1,
            "Descripcion_campus": "CASA CENTRAL",
            "Estado_campus": 1
        },
        "Estado_maestro": {
            "Cod_EstadoMaestro": 1,
            "Descripcion_EstadoMaestro": "INACTIVO"
        },
        "Suspension": null,
        "Reglamento": {
            "Id_reglamento": 1,
            "Descripcion_reglamento": "descrip",
            "Anio": 1900,
            "Vigencia": "SI"
        },
        "Tipo_programa": {
            "Cod_tipoPrograma": 1,
            "Descripcion_tp": "TipodePrograma",
            "Categoria": {
                "Cod_CategoriaTP": 1,
                "Descripcion_categoria": "POSTGRADO"
            }
        },
        "Unidad_academica": {
            "Cod_unidad_academica": 1,
            "Descripcion_ua": "DescripUa",
            "Facultad": {
                "Cod_facultad": 1,
                "Descripcion_facu": "ARQUITECTURA",
                "Estado": 1
            }
        },
        "Acreditacion": {
            "Cod_acreditacion": 1,
            "Acreditado": "SI",
            "Certificado": "NO",
            "Nombre_ag_acredit": "AgAcredit",
            "Nombre_ag_certif": "N/A",
            "Evaluacion_interna": "SI",
            "Fecha_informe": "2024-09-05T00:00:00.000Z",
            "tiempo": {
                "Cod_tiempoacredit": 1,
                "Fecha_inicio": "2024-09-30T00:00:00.000Z",
                "Fecha_termino": "2029-09-01T00:00:00.000Z",
                "Cantidad_anios": 5
            }
        }
    },
    {
        "Cod_Programa": 1341,
        "Centro_costo": "12341234",
        "Nombre_programa": "programa1",
        "Titulo": "",
        "Director": "15078849-8",
        "Director_alterno": "15078849-8",
        "Rexe": "",
        "Codigo_SIES": "",
        "Creditos_totales": 1234,
        "Horas_totales": 1234,
        "Grupo_correo": "",
        "Grado_academico": "",
        "Campus": {
            "Cod_Campus": 4,
            "Descripcion_campus": "QUINTERO",
            "Estado_campus": 1
        },
        "Estado_maestro": {
            "Cod_EstadoMaestro": 2,
            "Descripcion_EstadoMaestro": "SUSPENSIÓN"
        },
        "Suspension": {
            "ID_TipoSuspension": 1,
            "Descripcion_TipoSuspension": "TEMPORAL"
        },
        "Reglamento": {
            "Id_reglamento": 2,
            "Descripcion_reglamento": "Reglamento Magíster en Derecho",
            "Anio": 2024,
            "Vigencia": "SI"
        },
        "Tipo_programa": {
            "Cod_tipoPrograma": 2,
            "Descripcion_tp": "DOCTORADO",
            "Categoria": {
                "Cod_CategoriaTP": 1,
                "Descripcion_categoria": "POSTGRADO"
            }
        },
        "Unidad_academica": {
            "Cod_unidad_academica": 2,
            "Descripcion_ua": "Escuela de Ingeniería Civil en Informática",
            "Facultad": {
                "Cod_facultad": 11,
                "Descripcion_facu": "INGENIERÍA",
                "Estado": 1
            }
        },
        "Acreditacion": {
            "Cod_acreditacion": 2,
            "Acreditado": "SI",
            "Certificado": "NO",
            "Nombre_ag_acredit": "test123",
            "Nombre_ag_certif": "N/A",
            "Evaluacion_interna": "SI",
            "Fecha_informe": "2024-09-25T00:00:00.000Z",
            "tiempo": {
                "Cod_tiempoacredit": 2,
                "Fecha_inicio": "2024-09-30T00:00:00.000Z",
                "Fecha_termino": "2029-09-05T00:00:00.000Z",
                "Cantidad_anios": 5
            }
        }
    },
    {
        "Cod_Programa": 1473,
        "Centro_costo": "315122015",
        "Nombre_programa": "DOCTORADO EN DERECHO",
        "Titulo": "Titulo",
        "Director": "15078849-8",
        "Director_alterno": "15078849-8",
        "Rexe": "1750/12",
        "Codigo_SIES": "CODSIES",
        "Creditos_totales": 0,
        "Horas_totales": 4297,
        "Grupo_correo": "GrupCorreo",
        "Grado_academico": "GRADOACADEMICO",
        "Campus": {
            "Cod_Campus": 1,
            "Descripcion_campus": "CASA CENTRAL",
            "Estado_campus": 1
        },
        "Estado_maestro": {
            "Cod_EstadoMaestro": 1,
            "Descripcion_EstadoMaestro": "INACTIVO"
        },
        "Suspension": null,
        "Reglamento": {
            "Id_reglamento": 1,
            "Descripcion_reglamento": "descrip",
            "Anio": 1900,
            "Vigencia": "SI"
        },
        "Tipo_programa": {
            "Cod_tipoPrograma": 1,
            "Descripcion_tp": "TipodePrograma",
            "Categoria": {
                "Cod_CategoriaTP": 1,
                "Descripcion_categoria": "POSTGRADO"
            }
        },
        "Unidad_academica": {
            "Cod_unidad_academica": 1,
            "Descripcion_ua": "DescripUa",
            "Facultad": {
                "Cod_facultad": 1,
                "Descripcion_facu": "ARQUITECTURA",
                "Estado": 1
            }
        },
        "Acreditacion": {
            "Cod_acreditacion": 1,
            "Acreditado": "SI",
            "Certificado": "NO",
            "Nombre_ag_acredit": "AgAcredit",
            "Nombre_ag_certif": "N/A",
            "Evaluacion_interna": "SI",
            "Fecha_informe": "2024-09-05T00:00:00.000Z",
            "tiempo": {
                "Cod_tiempoacredit": 1,
                "Fecha_inicio": "2024-09-30T00:00:00.000Z",
                "Fecha_termino": "2029-09-01T00:00:00.000Z",
                "Cantidad_anios": 5
            }
        }
    },
    {
        "Cod_Programa": 1509,
        "Centro_costo": "311192001",
        "Nombre_programa": "MAGISTER EN DESARROLLO REGIONAL Y MEDIO AMBIENTE",
        "Titulo": "Titulo",
        "Director": "15078849-8",
        "Director_alterno": "15078849-8",
        "Rexe": "R.931/13",
        "Codigo_SIES": "CODSIES",
        "Creditos_totales": 0,
        "Horas_totales": 1515,
        "Grupo_correo": "GrupCorreo",
        "Grado_academico": "GRADOACADEMICO",
        "Campus": {
            "Cod_Campus": 1,
            "Descripcion_campus": "CASA CENTRAL",
            "Estado_campus": 1
        },
        "Estado_maestro": {
            "Cod_EstadoMaestro": 1,
            "Descripcion_EstadoMaestro": "INACTIVO"
        },
        "Suspension": null,
        "Reglamento": {
            "Id_reglamento": 1,
            "Descripcion_reglamento": "descrip",
            "Anio": 1900,
            "Vigencia": "SI"
        },
        "Tipo_programa": {
            "Cod_tipoPrograma": 3,
            "Descripcion_tp": "MAGISTER",
            "Categoria": {
                "Cod_CategoriaTP": 1,
                "Descripcion_categoria": "POSTGRADO"
            }
        },
        "Unidad_academica": {
            "Cod_unidad_academica": 1,
            "Descripcion_ua": "DescripUa",
            "Facultad": {
                "Cod_facultad": 1,
                "Descripcion_facu": "ARQUITECTURA",
                "Estado": 1
            }
        },
        "Acreditacion": {
            "Cod_acreditacion": 1,
            "Acreditado": "SI",
            "Certificado": "NO",
            "Nombre_ag_acredit": "AgAcredit",
            "Nombre_ag_certif": "N/A",
            "Evaluacion_interna": "SI",
            "Fecha_informe": "2024-09-05T00:00:00.000Z",
            "tiempo": {
                "Cod_tiempoacredit": 1,
                "Fecha_inicio": "2024-09-30T00:00:00.000Z",
                "Fecha_termino": "2029-09-01T00:00:00.000Z",
                "Cantidad_anios": 5
            }
        }
    },
    {
        "Cod_Programa": 1512,
        "Centro_costo": "311192009",
        "Nombre_programa": "MAGISTER EN PATRIMONIO",
        "Titulo": "Titulo",
        "Director": "15078849-8",
        "Director_alterno": "15078849-8",
        "Rexe": "R.736/2013",
        "Codigo_SIES": "CODSIES",
        "Creditos_totales": 0,
        "Horas_totales": 1332,
        "Grupo_correo": "GrupCorreo",
        "Grado_academico": "GRADOACADEMICO",
        "Campus": {
            "Cod_Campus": 1,
            "Descripcion_campus": "CASA CENTRAL",
            "Estado_campus": 1
        },
        "Estado_maestro": {
            "Cod_EstadoMaestro": 1,
            "Descripcion_EstadoMaestro": "INACTIVO"
        },
        "Suspension": null,
        "Reglamento": {
            "Id_reglamento": 1,
            "Descripcion_reglamento": "descrip",
            "Anio": 1900,
            "Vigencia": "SI"
        },
        "Tipo_programa": {
            "Cod_tipoPrograma": 1,
            "Descripcion_tp": "TipodePrograma",
            "Categoria": {
                "Cod_CategoriaTP": 1,
                "Descripcion_categoria": "POSTGRADO"
            }
        },
        "Unidad_academica": {
            "Cod_unidad_academica": 1,
            "Descripcion_ua": "DescripUa",
            "Facultad": {
                "Cod_facultad": 1,
                "Descripcion_facu": "ARQUITECTURA",
                "Estado": 1
            }
        },
        "Acreditacion": {
            "Cod_acreditacion": 1,
            "Acreditado": "SI",
            "Certificado": "NO",
            "Nombre_ag_acredit": "AgAcredit",
            "Nombre_ag_certif": "N/A",
            "Evaluacion_interna": "SI",
            "Fecha_informe": "2024-09-05T00:00:00.000Z",
            "tiempo": {
                "Cod_tiempoacredit": 1,
                "Fecha_inicio": "2024-09-30T00:00:00.000Z",
                "Fecha_termino": "2029-09-01T00:00:00.000Z",
                "Cantidad_anios": 5
            }
        }
    },
    {
        "Cod_Programa": 1710,
        "Centro_costo": "311142003",
        "Nombre_programa": "MAGISTER EN CINE Y ARTES AUDIOVISUALES",
        "Titulo": "Titulo",
        "Director": "15078849-8",
        "Director_alterno": "15078849-8",
        "Rexe": "R.6040/19",
        "Codigo_SIES": "CODSIES",
        "Creditos_totales": 0,
        "Horas_totales": 1494,
        "Grupo_correo": "GrupCorreo",
        "Grado_academico": "GRADOACADEMICO",
        "Campus": {
            "Cod_Campus": 1,
            "Descripcion_campus": "CASA CENTRAL",
            "Estado_campus": 1
        },
        "Estado_maestro": {
            "Cod_EstadoMaestro": 1,
            "Descripcion_EstadoMaestro": "INACTIVO"
        },
        "Suspension": null,
        "Reglamento": {
            "Id_reglamento": 1,
            "Descripcion_reglamento": "descrip",
            "Anio": 1900,
            "Vigencia": "SI"
        },
        "Tipo_programa": {
            "Cod_tipoPrograma": 1,
            "Descripcion_tp": "TipodePrograma",
            "Categoria": {
                "Cod_CategoriaTP": 1,
                "Descripcion_categoria": "POSTGRADO"
            }
        },
        "Unidad_academica": {
            "Cod_unidad_academica": 1,
            "Descripcion_ua": "DescripUa",
            "Facultad": {
                "Cod_facultad": 1,
                "Descripcion_facu": "ARQUITECTURA",
                "Estado": 1
            }
        },
        "Acreditacion": {
            "Cod_acreditacion": 1,
            "Acreditado": "SI",
            "Certificado": "NO",
            "Nombre_ag_acredit": "AgAcredit",
            "Nombre_ag_certif": "N/A",
            "Evaluacion_interna": "SI",
            "Fecha_informe": "2024-09-05T00:00:00.000Z",
            "tiempo": {
                "Cod_tiempoacredit": 1,
                "Fecha_inicio": "2024-09-30T00:00:00.000Z",
                "Fecha_termino": "2029-09-01T00:00:00.000Z",
                "Cantidad_anios": 5
            }
        }
    },
    {
        "Cod_Programa": 1823,
        "Centro_costo": "315122002",
        "Nombre_programa": "MAGÍSTER EN DERECHO",
        "Titulo": "Titulo",
        "Director": "15078849-8",
        "Director_alterno": "15078849-8",
        "Rexe": "930-23",
        "Codigo_SIES": "CODSIES",
        "Creditos_totales": 0,
        "Horas_totales": 9081,
        "Grupo_correo": "GrupCorreo",
        "Grado_academico": "GRADOACADEMICO",
        "Campus": {
            "Cod_Campus": 1,
            "Descripcion_campus": "CASA CENTRAL",
            "Estado_campus": 1
        },
        "Estado_maestro": {
            "Cod_EstadoMaestro": 1,
            "Descripcion_EstadoMaestro": "INACTIVO"
        },
        "Suspension": null,
        "Reglamento": {
            "Id_reglamento": 1,
            "Descripcion_reglamento": "descrip",
            "Anio": 1900,
            "Vigencia": "SI"
        },
        "Tipo_programa": {
            "Cod_tipoPrograma": 1,
            "Descripcion_tp": "TipodePrograma",
            "Categoria": {
                "Cod_CategoriaTP": 1,
                "Descripcion_categoria": "POSTGRADO"
            }
        },
        "Unidad_academica": {
            "Cod_unidad_academica": 1,
            "Descripcion_ua": "DescripUa",
            "Facultad": {
                "Cod_facultad": 1,
                "Descripcion_facu": "ARQUITECTURA",
                "Estado": 1
            }
        },
        "Acreditacion": {
            "Cod_acreditacion": 1,
            "Acreditado": "SI",
            "Certificado": "NO",
            "Nombre_ag_acredit": "AgAcredit",
            "Nombre_ag_certif": "N/A",
            "Evaluacion_interna": "SI",
            "Fecha_informe": "2024-09-05T00:00:00.000Z",
            "tiempo": {
                "Cod_tiempoacredit": 1,
                "Fecha_inicio": "2024-09-30T00:00:00.000Z",
                "Fecha_termino": "2029-09-01T00:00:00.000Z",
                "Cantidad_anios": 5
            }
        }
    }
];

listProgramasNotMerged = [
    {
        "Cod_Programa": 1340,
        "Centro_costo": "318142013",
        "Nombre_programa": "MAGISTER EN GERONTOLOGÍA SOCIAL",
        "Tipo_programa": 1,
        "Titulo": "Titulo",
        "Director": "15078849-8",
        "Director_alterno": "15078849-8",
        "Rexe": "1057",
        "Codigo_SIES": "CODSIES",
        "ID_Reglamento": 1,
        "Cod_acreditacion": 1,
        "Creditos_totales": 0,
        "Horas_totales": 0,
        "Grupo_correo": "GrupCorreo",
        "Estado_maestro": 1,
        "Campus": 1,
        "Unidad_academica": 1,
        "Grado_academico": "GRADOACADEMICO",
        "ID_TipoSuspension": null,
        "Graduacion_Conjunta": null
    },
    {
        "Cod_Programa": 1341,
        "Centro_costo": "12341234",
        "Nombre_programa": "programa1",
        "Tipo_programa": 2,
        "Titulo": "",
        "Director": "15078849-8",
        "Director_alterno": "15078849-8",
        "Rexe": "",
        "Codigo_SIES": "",
        "ID_Reglamento": 2,
        "Cod_acreditacion": 2,
        "Creditos_totales": 1234,
        "Horas_totales": 1234,
        "Grupo_correo": "",
        "Estado_maestro": 2,
        "Campus": 4,
        "Unidad_academica": 2,
        "Grado_academico": "",
        "ID_TipoSuspension": 1,
        "Graduacion_Conjunta": 1
    },
    {
        "Cod_Programa": 1473,
        "Centro_costo": "315122015",
        "Nombre_programa": "DOCTORADO EN DERECHO",
        "Tipo_programa": 1,
        "Titulo": "Titulo",
        "Director": "15078849-8",
        "Director_alterno": "15078849-8",
        "Rexe": "1750/12",
        "Codigo_SIES": "CODSIES",
        "ID_Reglamento": 1,
        "Cod_acreditacion": 1,
        "Creditos_totales": 0,
        "Horas_totales": 4297,
        "Grupo_correo": "GrupCorreo",
        "Estado_maestro": 1,
        "Campus": 1,
        "Unidad_academica": 1,
        "Grado_academico": "GRADOACADEMICO",
        "ID_TipoSuspension": null,
        "Graduacion_Conjunta": null
    },
    {
        "Cod_Programa": 1509,
        "Centro_costo": "311192001",
        "Nombre_programa": "MAGISTER EN DESARROLLO REGIONAL Y MEDIO AMBIENTE",
        "Tipo_programa": 3,
        "Titulo": "Titulo",
        "Director": "15078849-8",
        "Director_alterno": "15078849-8",
        "Rexe": "R.931/13",
        "Codigo_SIES": "CODSIES",
        "ID_Reglamento": 1,
        "Cod_acreditacion": 1,
        "Creditos_totales": 0,
        "Horas_totales": 1515,
        "Grupo_correo": "GrupCorreo",
        "Estado_maestro": 1,
        "Campus": 1,
        "Unidad_academica": 1,
        "Grado_academico": "GRADOACADEMICO",
        "ID_TipoSuspension": null,
        "Graduacion_Conjunta": null
    },
    {
        "Cod_Programa": 1512,
        "Centro_costo": "311192009",
        "Nombre_programa": "MAGISTER EN PATRIMONIO",
        "Tipo_programa": 1,
        "Titulo": "Titulo",
        "Director": "15078849-8",
        "Director_alterno": "15078849-8",
        "Rexe": "R.736/2013     ",
        "Codigo_SIES": "CODSIES",
        "ID_Reglamento": 1,
        "Cod_acreditacion": 1,
        "Creditos_totales": 0,
        "Horas_totales": 1332,
        "Grupo_correo": "GrupCorreo",
        "Estado_maestro": 1,
        "Campus": 1,
        "Unidad_academica": 1,
        "Grado_academico": "GRADOACADEMICO",
        "ID_TipoSuspension": null,
        "Graduacion_Conjunta": null
    },
    {
        "Cod_Programa": 1710,
        "Centro_costo": "311142003",
        "Nombre_programa": "MAGISTER EN CINE Y ARTES AUDIOVISUALES",
        "Tipo_programa": 1,
        "Titulo": "Titulo",
        "Director": "15078849-8",
        "Director_alterno": "15078849-8",
        "Rexe": "R.6040/19",
        "Codigo_SIES": "CODSIES",
        "ID_Reglamento": 1,
        "Cod_acreditacion": 1,
        "Creditos_totales": 0,
        "Horas_totales": 1494,
        "Grupo_correo": "GrupCorreo",
        "Estado_maestro": 1,
        "Campus": 1,
        "Unidad_academica": 1,
        "Grado_academico": "GRADOACADEMICO",
        "ID_TipoSuspension": null,
        "Graduacion_Conjunta": null
    },
    {
        "Cod_Programa": 1823,
        "Centro_costo": "315122002",
        "Nombre_programa": "MAGÍSTER EN DERECHO",
        "Tipo_programa": 1,
        "Titulo": "Titulo",
        "Director": "15078849-8",
        "Director_alterno": "15078849-8",
        "Rexe": "930-23",
        "Codigo_SIES": "CODSIES",
        "ID_Reglamento": 1,
        "Cod_acreditacion": 1,
        "Creditos_totales": 0,
        "Horas_totales": 9081,
        "Grupo_correo": "GrupCorreo",
        "Estado_maestro": 1,
        "Campus": 1,
        "Unidad_academica": 1,
        "Grado_academico": "GRADOACADEMICO",
        "ID_TipoSuspension": null,
        "Graduacion_Conjunta": null
    }
]

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

        // if (haveLogica) {
        //     listProgramas = await invoker(
        //         global.config.serv_basePostgrado,
        //         `${prog.s}/${prog.get}`,
        //         null
        //     );
        // }



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
            [campos_prog.ID_TipoSuspension] : 0
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
                                extrasValueCode: args.Cod_Programa,
                                extrasKeyDescription: 'nombrePrograma',
                                extrasValueDescription: args.Nombre_programa
                            })
                        break;
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
                    console.log("entre a este error");
                    //TODO: SPRINT 5. DELETE PROGRAMA
                    // await invoker(
                    //     global.config.serv_basePostgrado,
                    //     `${prog.s}/${prog.delete}`,
                    //     { [campos_prog.Cod_Programa] : args.Cod_Programa }
                    // );
                }else{
                    listProgramas = listProgramas.filter( prog => prog[campos_prog.Cod_Programa] != args.Cod_Programa)
                }
                throw error;
            }
        }
        let insertLog = await insertLogPrograma(req, args.Cod_Programa,'CREACIÓN DE PROGRAMA','C')
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