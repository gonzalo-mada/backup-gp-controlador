'use strict';
var invoker = require('../../base/invokers/invoker.invoker');
var reply = require('../../base/utils/reply');
var validador = require('../../base/utils/validador');
const reportInvoker = require("../../base/invokers/report.invoker");
const { getNextCodigo, insertDocs, updateDocs } = require('../utils/gpUtils')
const { em, campos_em } = require("./estado-maestro.service")

let listSuspension = [];
let listEstadosMaestros = [];
const haveLogica = true;
const susp = {
    "s" : "suspension",
    "get" : "getSupension",
    "insert" : "insertSuspension",
    "update" : "updateSuspension",
    "delete" : "deleteSupension",
};

listSuspension = [
    {
        "ID_TipoSuspension": 1,
        "Descripcion_TipoSuspension": "Temporal",
        "Cod_EstadoMaestro": 2
    },
    {
        "ID_TipoSuspension": 2,
        "Descripcion_TipoSuspension": "Indefinida",
        "Cod_EstadoMaestro": 2
    }
];

const campos_susp = {
    "ID_TipoSuspension": "idTipoSusp",
    "Descripcion_TipoSuspension": "descripcionSusp",
    "Cod_EstadoMaestro": "codigoEstM"
};

let getSuspensiones = async (req, res) => {
    try {
        if (haveLogica) {
            listEstadosMaestros = await invoker(
                global.config.serv_basePostgrado,
                `${em.s}/${em.get}`,
                null
            );
            listSuspension = await invoker(
                global.config.serv_basePostgrado,
                `${susp.s}/${susp.get}`,
                null
            );
        }

        let listMerge = listSuspension.map( susp => {
            let em = listEstadosMaestros.find( em => em[campos_em.Cod_EstadoMaestro] === susp.codigoEstM)
            return {
                "ID_TipoSuspension": susp.id,
                "Descripcion_TipoSuspension": susp.descripcion,
                "estadomaestro" : em ? {
                    "Cod_EstadoMaestro": em[campos_em.Cod_EstadoMaestro],
                    "Descripcion_EstadoMaestro": em[campos_em.Descripcion_EstadoMaestro],
                } : null
            }
        });
        res.json(reply.ok(listMerge));
    } catch (e) {
        res.json(reply.fatal(e));
    }
};

let insertSuspension = async (req, res) => {
    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "cadena", "Descripcion_TipoSuspension", true);

        if (msg != "") {
            res.json(reply.error(msg));
            return;
        };

        if (haveLogica) {
            listSuspension = await invoker(
                global.config.serv_basePostgrado,
                `${susp.s}/${susp.get}`,
                null
            );
        }

        let codigo_susp = getNextCodigo(listSuspension,'id');

        let params = {
            [campos_susp.ID_TipoSuspension]: parseInt(codigo_susp),
            [campos_susp.Descripcion_TipoSuspension]: args.Descripcion_TipoSuspension,
        };

        let insertSuspension;

        if (haveLogica) {
            insertSuspension = await invoker (
                global.config.serv_basePostgrado,
                `${susp.s}/${susp.insert}`,
                params
            );
        }else{
            insertSuspension = listSuspension.push(params);
        }

        if (!insertSuspension) {
            res.json(reply.error(`La suspensión no pudo ser creada.`));
            return;
        }else{
            try {
                await insertDocs({
                    arrayDocs: args.docsToUpload,
                    coleccion: 'suspension',
                    extrasKeyCode: campos_susp.ID_TipoSuspension,
                    extrasValueCode: codigo_susp,
                    extrasKeyDescription: 'nombreSuspension',
                    extrasValueDescription: args.Descripcion_TipoSuspension
                })
            } catch (error) {
                if (haveLogica) {
                    await invoker(
                        global.config.serv_basePostgrado,
                        `${susp.s}/${susp.delete}`,
                        { [campos_susp.ID_TipoSuspension] : parseInt(codigo_susp) }
                    );
                }else{
                    listSuspension = listSuspension.filter( susp => susp[campos_susp.ID_TipoSuspension] != parseInt(codigo_susp))
                }
                throw error;
            }
        }
        let response = { dataWasInserted: insertSuspension , dataInserted: args.Descripcion_TipoSuspension}
        res.json(reply.ok(response));
    } catch (e) {
        res.json(reply.fatal(e));
    }
};

let updateSuspension = async (req, res) => {
    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "number", "ID_TipoSuspension", true);
        msg += validador.validarParametro(args, "cadena", "Descripcion_TipoSuspension", true);

        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }

        if (args.docsToDelete !== undefined) {
            if (args.docsToDelete.length != 0) {
                for (let i = 0; i < args.docsToDelete.length; i++) {
                    const doc = args.docsToDelete[i];
    
                    let deleteDoc = await invoker(
                        global.config.serv_mongoDocumentos,
                        "documentos/eliminarDocumento",
                        {
                            database: "gestionProgramas",
                            coleccion: "suspension",
                            id: doc.id
            
                        }
                    );
    
                    if (!deleteDoc.deleted) {
                        res.json(reply.error(`El documento no pudo ser eliminado.`));
                        return;
                    }
                }
            }
        }

        await updateDocs({
            arrayDocs: args.docsToUpload,
            coleccion: 'suspension',
            extrasKeyCode: campos_susp.ID_TipoSuspension,
            extrasValueCode: args.ID_TipoSuspension,
            extrasKeyDescription: 'nombreSuspension',
            extrasValueDescription: args.Descripcion_TipoSuspension
        });

        let params = {
            [campos_susp.ID_TipoSuspension]: args.ID_TipoSuspension,
            [campos_susp.Descripcion_TipoSuspension]: args.Descripcion_TipoSuspension,
        };

        let updateSuspension;

        if (haveLogica) {
            updateSuspension = await invoker (
                global.config.serv_basePostgrado,
                `${susp.s}/${susp.update}`,
                params
            );
        }else{
            let index_susp = listSuspension.findIndex( item => item.ID_TipoSuspension === params[campos_susp.ID_TipoSuspension])
            if (index_susp !== -1 ) {
                updateSuspension = listSuspension[index_susp] = {...listSuspension[index_susp], ...params}
            }else{
                updateSuspension = null;
            }
        }

        let response = { dataWasUpdated: updateSuspension, dataUpdated: args.Descripcion_TipoSuspension }
        res.json(reply.ok(response));
    } catch (e) {
        res.json(reply.fatal(e));
    }
}

let deleteSuspension = async (req, res) => {
    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "lista", "suspensionToDelete", true);

        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }

        let suspensionToDelete = args.suspensionToDelete;

        for (let i = 0; i < suspensionToDelete.length; i++) {
            const e = suspensionToDelete[i];
            
            let params = {
                [campos_susp.ID_TipoSuspension] : parseInt(e.ID_TipoSuspension)
            }

            let deleteSuspension;

            if (haveLogica) {
                deleteSuspension = await invoker (
                    global.config.serv_basePostgrado,
                    `${susp.s}/${susp.delete}`,
                    params
                );
            }else{
                deleteSuspension = listSuspension = listSuspension.filter( susp => susp[campos_susp.ID_TipoSuspension] != parseInt(e.ID_TipoSuspension))
            }

            if (!deleteSuspension){
                res.json(reply.error(`La suspensión no pudo ser eliminada.`));
                return;
            };

            let documentos = await invoker(
                global.config.serv_mongoDocumentos,
                "documentos/buscarDocumentos",
                {
                    database: "gestionProgramas",
                    coleccion: "suspension",
                    documento: {
                        [`extras.${campos_susp.ID_TipoSuspension}`]: e.ID_TipoSuspension
                    },
                }
            );

            for(let d of documentos){
                await invoker(
                    global.config.serv_mongoDocumentos,
                    "documentos/eliminarDocumento",
                    {
                        database: 'gestionProgramas',
                        coleccion: 'suspension',
                        id: d.id,
                    }
                );
            }
        }

        let response = { dataWasDeleted: true , dataDeleted: suspensionToDelete}
        res.json(reply.ok(response));

    } catch (e) {
        res.json(reply.fatal(e));
    }
};

let getDocumentosWithBinary = async (req, res) => {

    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "numero","ID_TipoSuspension", true);
 
        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }
 
        let documentos = await invoker(
            global.config.serv_mongoDocumentos,
            "documentos/buscarDocumentos",
            {
                database: "gestionProgramas",
                coleccion: "suspension",
                documento: {
                    [`extras.${campos_susp.ID_TipoSuspension}`]: args.ID_TipoSuspension
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
                    coleccion: "suspension",
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
                coleccion: "suspension",
                id: args.id,
            }
        );

        res.send(archivo);
    } catch (e) {
        res.json(reply.fatal(e));
    }
};

module.exports = {
    getSuspensiones,
    insertSuspension,
    updateSuspension,
    deleteSuspension,
    getDocumentosWithBinary,
    getArchiveDoc
}