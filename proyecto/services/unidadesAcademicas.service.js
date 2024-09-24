'use strict';
var invoker = require('../../base/invokers/invoker.invoker');
var reply = require('../../base/utils/reply');
var validador = require('../../base/utils/validador');
const uuid = require("uuid");
const reportInvoker = require("../../base/invokers/report.invoker");
const { getRandomColor, getTextColor, badgeColorMapping} = require("../utils/colors.js");
const { insertDocs, updateDocs } = require('../utils/gpUtils.js');


//mongo

let getDocumentosWithBinary = async (req, res) => {

    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "cadena","Cod_unidad_academica", true);
 
        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }
 
        let documentos = await invoker(
            global.config.serv_mongoDocumentos,
            "documentos/buscarDocumentos",
            {
                database: "gestionProgramas",
                coleccion: "unidades_academicas",
                documento: {
                    "extras.Cod_unidad_academica": parseInt(args.Cod_unidad_academica)
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
                    coleccion: "unidades_academicas",
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

let getArchiveDoc = async (req, res) => {
    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "cadena", "id", true);
 
        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }
 
        let archivo = await reportInvoker(
            global.config.serv_mongoDocumentos,
            "documentos/obtenerArchivoDocumento",
            {
                database: "gestionProgramas",
                coleccion: "unidades_academicas",
                id: args.id,
            }
        );

        res.send(archivo);
    } catch (e) {
        res.json(reply.fatal(e));
    }
};


//NUEVOS SERVICIOS USANDO LOGICA
let logica_getUnidadesAcademicas = async (req, res) => {
    try {
        const colorMapping = {};
        // Obtener unidades académicas
        let unidades_academicas = await invoker(
            global.config.serv_basePostgrado,
            'unidadesAcademicas/getUnidadesAcademicas',
            null
        );

        // Obtener facultades y mapearlas a la estructura de la interfaz
        let facultades = await invoker(
            global.config.serv_campus,
            'postgrado/getFacultades',
            null
        );

        facultades.forEach(facultad => {
            const randomColor = getRandomColor();
            if (!colorMapping[facultad.codigo]) {
                colorMapping[facultad.codigo] = badgeColorMapping[facultad.codigo] || { backgroundColor: randomColor, textColor: getTextColor(randomColor) };
            }
        });

        let listUnidadesAcademicas = unidades_academicas.map( ua => {
            let facultad = facultades.find( facultad => facultad.codigo === ua.codfacu)
            return {
                "Cod_unidad_academica": ua.coduni,
                "Descripcion_ua" : ua.descripcion,
                "Facultad": facultad ? {
                    "Cod_facultad": parseInt(facultad.codigo),
                    "Descripcion_facu": facultad.descripcion,
                    "Estado": facultad.estado,
                    "BadgeClass": colorMapping[facultad.codigo]
                } : null
            }
        })

        // let facultadesMap = {};
        // facultades.forEach(fac => {
        //     facultadesMap[fac.codigo] = {
        //         Cod_facultad: fac.codigo,           // Mapeo a la estructura de Facultad
        //         Descripcion_facu: fac.descripcion,
        //         Estado: fac.estado   // Mapeo a la estructura de Facultad
        //     };
        // });

        // // Mapear las unidades académicas para incluir la facultad
        // let ua_con_facultades = unidades_academicas.map(ua => ({
        //     Cod_unidad_academica: ua.coduni,   // Asume que `coduni` es el identificador
        //     Descripcion_ua: ua.descripcion,    // Asume que `descripcion` es el nombre
        //     Cod_facultad: ua.codfacu,          // Asume que `codfacu` es el identificador de la facultad
        //     facultad: facultadesMap[ua.codfacu] || null  // Asocia la facultad si existe
        // }));

        // Enviar la respuesta con la información combinada
        res.json(reply.ok(listUnidadesAcademicas));
    } catch (e) {
        res.json(reply.fatal(e));
    }
};



//INSERT LOGICA pendiente

let logica_insertUnidadesAcademicas = async (req, res) => {
    
	try {
		let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
		let msg = validador.validarParametro(args, "cadena", "Descripcion_ua", true);
        msg += validador.validarParametro(args, "number", "Cod_facultad", true);
        // msg += validador.validarParametro(args, "lista", "docs", false);

		if (msg != "") {
            res.json(reply.error(msg));
            return;
        }

        let response = {};

        //INSERTAR UNIDAD ACADEMICA
        
        let unidades_academicas = await invoker(
            global.config.serv_basePostgrado,
            'unidadesAcademicas/getUnidadesAcademicas',
            null
        );

        let uaExists = unidades_academicas.some(ua => (String(ua.descripcion).toLowerCase() === String(args.Descripcion_ua).toLowerCase()) );

        if (uaExists) {
            res.json(reply.error(`La unidad académica ${args.Descripcion_ua} ya existe.`));
            return;
        }

        let ultimoObjeto = unidades_academicas[unidades_academicas.length - 1];
        let ultimoCodigo = ultimoObjeto.coduni;
        let codigoUnidadAcad = ultimoCodigo + 1; 

		let params = { 
			codigoUnidad: parseInt(codigoUnidadAcad),
			descripcionUnidad: args.Descripcion_ua,
            codigoFacultad: args.Cod_facultad
		}

		let insertUnidadAcademica = await invoker(
            global.config.serv_basePostgrado,
            'unidadesAcademicas/insertUnidadesAcademicas',
            params
        );

        if (!insertUnidadAcademica){
            res.json(reply.error(`La unidad académica no pudo ser creada.`));
            return;
        }else{
            try {
                await insertDocs({
                    arrayDocs: args.docsToUpload,
                    coleccion: 'unidades_academicas',
                    extrasKeyCode: 'Cod_unidad_academica',
                    extrasValueCode: codigoUnidadAcad,
                    extrasKeyDescription: 'nombreUnidadAcad',
                    extrasValueDescription: args.Descripcion_ua
                });
            } catch (error) {
                let params = {
                    codigoUnidad: parseInt(codigoUnidadAcad),
                }
                await invoker(
                    global.config.serv_basePostgrado,
                    'unidadesAcademicas/deleteUnidadesAcademicas',
                    params
                );
                res.json(reply.error(`Error al insertar documento.`));
                return;
            }
        }

        response = { dataWasInserted: insertUnidadAcademica , dataInserted: args.Descripcion_ua}

		res.json(reply.ok(response));

	} catch (e) {
		res.json(reply.fatal(e));
	}
}

let logica_updateUnidadesAcademicas = async (req, res) => {
	try {
		let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "number", "Cod_unidad_academica", true);
		msg += validador.validarParametro(args, "cadena", "Descripcion_ua", true);
        msg += validador.validarParametro(args, "number", "Cod_facultad", true);

		if (msg != "") {
            res.json(reply.error(msg));
            return;
        }

        let response = {};
        let docs = [];

        //docs por eliminar
        if (args.docsToDelete.length != 0) {
            for (let i = 0; i < args.docsToDelete.length; i++) {
                const doc = args.docsToDelete[i];

                let deleteDoc = await invoker(
                    global.config.serv_mongoDocumentos,
                    "documentos/eliminarDocumento",
                    {
                        database: "gestionProgramas",
                        coleccion: "unidades_academicas",
                        id: doc.id
        
                    }
                );

                if (!deleteDoc.deleted) {
                    res.json(reply.error(`El documento no pudo ser eliminado.`));
                    return;
                }
            }
        }

        await updateDocs({
            arrayDocs: args.docsToUpload,
            coleccion: 'unidades_academicas',
            extrasKeyCode: 'Cod_unidad_academica',
            extrasValueCode: args.Cod_unidad_academica,
            extrasKeyDescription: 'nombreUnidadAcad',
            extrasValueDescription: args.Descripcion_ua
        });

        let params = {
            codigoUnidad: parseInt(args.Cod_unidad_academica),
			descripcionUnidad: args.Descripcion_ua,
            codigoFacultad: args.Cod_facultad
        }

        let updateUnidadAcademica = await invoker(
            global.config.serv_basePostgrado,
            'unidadesAcademicas/updateUnidadesAcademicas',
            params
        );

        if (!updateUnidadAcademica){
            res.json(reply.error(`La unidad académica no pudo ser actualizada.`));
            return;
        }
        
        response = { dataWasUpdated: updateUnidadAcademica , dataUpdated: args.Descripcion_ua }
		res.json(reply.ok(response));

	} catch (e) {
		res.json(reply.fatal(e));
	}
}

let logica_deleteUnidadesAcademicas = async (req, res) => {
    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "lista", "unidadAcadToDelete", true);

        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }

        let unidadAcadToDelete = args.unidadAcadToDelete;
        
        for (let i = 0; i < unidadAcadToDelete.length; i++) {
            const e = unidadAcadToDelete[i];
            
            let params = {
                codigoUnidad: parseInt(e.Cod_unidad_academica),
            }

            let deleteUa = await invoker(
                global.config.serv_basePostgrado,
                'unidadesAcademicas/deleteUnidadesAcademicas',
                params
            );

            if (!deleteUa){
                res.json(reply.error(`La unidad académica no pudo ser eliminada.`));
                return;
            }

            let documentos = await invoker(
                global.config.serv_mongoDocumentos,
                "documentos/buscarDocumentos",
                {
                    database: "gestionProgramas",
                    coleccion: "unidades_academicas",
                    documento: {
                        "extras.Cod_unidad_academica": e.Cod_unidad_academica
                    },
                }
            );

            for(let d of documentos){
                await invoker(
                    global.config.serv_mongoDocumentos,
                    "documentos/eliminarDocumento",
                    {
                        database: 'gestionProgramas',
                        coleccion: 'unidades_academicas',
                        id: d.id,
                    }
                );
            }
        }

        let response = { dataWasDeleted: true , dataDeleted: unidadAcadToDelete}
        res.json(reply.ok(response));

    } catch (e) {
        res.json(reply.fatal(e));
    }
}

module.exports = {
    //mongo
    getDocumentosWithBinary,
    getArchiveDoc,

    // //logicas ua
    logica_getUnidadesAcademicas,
    logica_insertUnidadesAcademicas,
    logica_updateUnidadesAcademicas,
    logica_deleteUnidadesAcademicas,
}