'use strict';
var invoker = require('../../base/invokers/invoker.invoker');
var reply = require('../../base/utils/reply');
var validador = require('../../base/utils/validador');
const reportInvoker = require("../../base/invokers/report.invoker");
const { getNextCodigo, insertDocs, updateDocs } = require('../utils/gpUtils')

let getReglamentos = async (req, res) => {
    try {
        let reglamentos = await invoker(
            global.config.serv_basePostgrado,
            'reglamento/getReglamento',
            null
        );

        reglamentos = reglamentos.map( e => {
            return {
                Cod_reglamento: e.id,
                Descripcion_regla: e.descripcion,
                anio: e.anio.toString(),
                vigencia: e.vigencia === 'SI' ? true : false
            }
        })
        
        res.json(reply.ok(reglamentos));
    } catch (e) {
        res.json(reply.fatal(e));
    } 
}

let insertReglamento = async (req, res) => {
    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "cadena", "Descripcion_regla", true);

        if (msg != "") {
            res.json(reply.error(msg));
            return;
        };

        let reglamentos = await invoker(
            global.config.serv_basePostgrado,
            'reglamento/getReglamento',
            null
        );

        let codigo_susp = getNextCodigo(reglamentos,'id');

        let params = {
            idReglamento: parseInt(codigo_susp),
            descripcionRegla: args.Descripcion_regla,
            anio: args.anio,
            vigencia: args.vigencia === true ? 'SI' : 'NO'
        };

        let insertReglamento = await invoker(
            global.config.serv_basePostgrado,
            'reglamento/insertReglamento',
            params
        );

        if (!insertReglamento) {
            return res.json(reply.error(`El reglamento no pudo ser creado.`));
        }else{
            try {
                await insertDocs({
                    arrayDocs: args.docsToUpload,
                    coleccion: 'reglamentos',
                    extrasKeyCode: 'Cod_reglamento',
                    extrasValueCode: codigo_susp,
                    extrasKeyDescription: 'nombreSuspension',
                    extrasValueDescription: args.Descripcion_regla
                })
            } catch (error) {
                let params = {
                    idReglamento: parseInt(codigo_susp),
                };
                await invoker(
                    global.config.serv_basePostgrado,
                    'reglamento/deleteReglamento',
                    params
                );
                return res.json(reply.error(`Error al insertar documento: ${error.message}`));
            }
        }

        let response = { dataWasInserted: insertReglamento, dataInserted: args.Descripcion_regla };
        return res.json(reply.ok(response));
    } catch (error) {
        return res.json(reply.fatal(error));
    }
};

let updateReglamento = async (req, res) => {
    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "number", "Cod_reglamento", true);
        msg += validador.validarParametro(args, "cadena", "Descripcion_regla", true);
        msg += validador.validarParametro(args, "number", "anio", true);
        msg += validador.validarParametro(args, "boolean", "vigencia", true);

        if (msg !== "") {
            res.json(reply.error(msg));
            return;
        }

        // Eliminar documentos si es necesario
        if (args.docsToDelete && args.docsToDelete.length > 0) {
            for (let doc of args.docsToDelete) {
                let deleteDoc = await invoker(
                    global.config.serv_mongoDocumentos,
                    "documentos/eliminarDocumento",
                    {
                        database: "gestionProgramas",
                        coleccion: "reglamentos",
                        id: doc.id 
                    }
                );

                if (!deleteDoc.deleted) {
                    return res.json(reply.error(`El documento ${doc.nombre} no pudo ser eliminado.`));
                }
            }
        }

        await updateDocs({
            arrayDocs: args.docsToUpload,
            coleccion: 'reglamentos',
            extrasKeyCode: 'Cod_reglamento',
            extrasValueCode: args.Cod_reglamento,
            extrasKeyDescription: 'nombreSuspension',
            extrasValueDescription: args.Descripcion_regla
        });

        // Actualizar reglamento
        let params = {
            idReglamento: parseInt(args.Cod_reglamento),
            descripcionRegla: args.Descripcion_regla,
            anio: args.anio,
            vigencia: args.vigencia === true ? 'SI' : 'NO'
        };

        let updateReglamento = await invoker(
            global.config.serv_basePostgrado,
            'reglamento/updateReglamento',
            params
        );
        
        if (!updateReglamento) {
            return res.json(reply.error(`El reglamento no pudo ser actualizado.`));
        }

        let response = { dataWasUpdated: updateReglamento, dataUpdated: args.Descripcion_regla, };
        return res.json(reply.ok(response));

    } catch (error) {
        return res.json(reply.fatal(error));
    }
};

let deleteReglamentos = async (req, res) => {
    try {
        // Parsear los argumentos recibidos
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        // Validar que se haya proporcionado una lista de reglamentos a eliminar
        let msg = validador.validarParametro(args, "lista", "reglamentoToDelete", true);
        if (msg !== "") {
            return res.json(reply.error(msg));
        }

        let reglamentoToDelete = args.reglamentoToDelete;

        // Iterar sobre cada reglamento que se desea eliminar
        for (let i = 0; i < reglamentoToDelete.length; i++) {
            const e = reglamentoToDelete[i];

            let params = {
                cod_reglamento: parseInt(e.Cod_reglamento),
            };

            // Eliminar el reglamento
            let deleteRegla = await invoker(
                global.config.serv_basePostgrado,
                'reglamento/deleteReglamento',
                params
            );

            if (!deleteRegla) {
                return res.json(reply.error(`El reglamento con código ${e.Cod_reglamento} no pudo ser eliminado.`));
            }

            // Buscar los documentos asociados al reglamento
            let documentos = await invoker(
                global.config.serv_mongoDocumentos,
                "documentos/buscarDocumentos",
                {
                    database: "gestionProgramas",
                    coleccion: "reglamentos",
                    documento: {
                        "extras.Cod_reglamento": e.Cod_reglamento
                    },
                }
            );

            // Eliminar todos los documentos asociados
            for (let d of documentos) {
                let deleteDoc = await invoker(
                    global.config.serv_mongoDocumentos,
                    "documentos/eliminarDocumento",
                    {
                        database: 'gestionProgramas',
                        coleccion: 'reglamentos',
                        id: d.id,
                    }
                );
                
                if (!deleteDoc.deleted) {
                    return res.json(reply.error(`El documento con ID ${d.id} no pudo ser eliminado.`));
                }
            }
        }

        // Respuesta exitosa si todo fue eliminado correctamente
        let response = { dataWasDeleted: true, dataDeleted: reglamentoToDelete };
        return res.json(reply.ok(response));

    } catch (error) {
        return res.json(reply.fatal(error));
    }
};


let getDocumentosWithBinary = async (req, res) => {

    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "cadena","Cod_reglamento", true);
 
        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }
 
        let documentos = await invoker(
            global.config.serv_mongoDocumentos,
            "documentos/buscarDocumentos",
            {
                database: "gestionProgramas",
                coleccion: "reglamentos",
                documento: {
                    "extras.Cod_reglamento": parseInt(args.Cod_reglamento)
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
                    coleccion: "reglamentos",
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
                coleccion: "reglamentos",
                id: args.id,
            }
        );

        res.send(archivo);
    } catch (e) {
        res.json(reply.fatal(e));
    }
};


module.exports = {

     //mongo
     getDocumentosWithBinary,
     getArchiveDoc,

     //logicas
     getReglamentos,
     insertReglamento,
     updateReglamento,
     deleteReglamentos,
}