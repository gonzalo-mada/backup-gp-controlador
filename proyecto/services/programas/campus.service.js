'use strict';
var invoker = require('../../../base/invokers/invoker.invoker');
var reply = require('../../../base/utils/reply');
var validador = require('../../../base/utils/validador');
const reportInvoker = require("../../../base/invokers/report.invoker");
const { insertDocs, updateDocs } = require('../../utils/gpUtils');

let getDocumentosWithBinary = async (req, res) => {

    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "cadena","Cod_campus", true);
 
        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }
 
        let documentos = await invoker(
            global.config.serv_mongoDocumentos,
            "documentos/buscarDocumentos",
            {
                database: "gestionProgramas",
                coleccion: "campus",
                documento: {
                    "extras.Cod_campus": args.Cod_campus
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
                    coleccion: "campus",
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

let getArchivoDocumento = async (req, res) => {
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
                coleccion: "campus",
                id: args.id,
            }
        );

        res.send(archivo);
    } catch (e) {
        res.json(reply.fatal(e));
    }
};




//NUEVOS SERVICIOS USANDO LOGICA

let logica_getCampus = async (req, res) => {
    try {
        let campus = await invoker(
            global.config.serv_campus,
            'postgrado/getCampus',
            null
        );

        campus = campus.map( e => {
            return {
                Cod_campus : e.codigo,
                Descripcion_campus: e.descripcion,
                Estado_campus: e.estado === 1 ? true : false
            }
        })
        res.json(reply.ok(campus));
    } catch (e) {
        res.json(reply.fatal(e));
    }
};

let logica_insertCampus = async (req, res) => {
    try {
        let args = JSON.parse(req.body.arg === undefined ? '{}' : req.body.arg);
		let msg = validador.validarParametro(args, "cadena", "Descripcion_campus", true);
        msg += validador.validarParametro(args, "boolean", "Estado_campus", true);

        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }

        //INSERTAR CAMPUS
        let campus = await invoker(
            global.config.serv_campus,
            'postgrado/getCampus',
            null
        );

        let campusExists = campus.some(c => (String(c.descripcion).toLowerCase() === String(args.Descripcion_campus).toLowerCase()) );

        if (campusExists) {
            res.json(reply.error(`El campus ${args.Descripcion_campus} ya existe.`));
            return;
        }
        
        let ultimoObjeto = campus[campus.length - 1];
        let ultimoCodigo = ultimoObjeto.codigo;
        let codigoCampus = ultimoCodigo + 1; 

        let params = {
            codigoCampus: parseInt(codigoCampus),
            descripcionCampus: args.Descripcion_campus,
            estadoCampus: args.Estado_campus === true ? 1 : 0,
        }

        let insertCampus = await invoker(
            global.config.serv_campus,
            'postgrado/insertCampus',
            params
        );
       
        if (!insertCampus) {
            res.json(reply.error(`El campus no pudo ser creado.`));
            return;
        }else{
            try {
                await insertDocs({
                    arrayDocs: args.docsToUpload,
                    coleccion: 'campus',
                    extrasKeyCode: 'Cod_campus',
                    extrasValueCode: codigoCampus,
                    extrasKeyDescription: 'nombreCampus',
                    extrasValueDescription: args.Descripcion_campus
                })
            } catch (error) {
                let params = {
                    codigoCampus: parseInt(codigoCampus),
                }
                await invoker(
                    global.config.serv_campus,
                    'postgrado/deleteCampus',
                    params
                );
                res.json(reply.error(`Error al insertar documento.`));
                return;
            }
        }

        let response = { dataWasInserted: insertCampus, dataInserted: args.Descripcion_campus}
        res.json(reply.ok(response));

    } catch (e) {
        res.json(reply.fatal(e));
    }
};

let logica_updateCampus = async (req , res) => {
    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "cadena", "Cod_campus", true);
		msg += validador.validarParametro(args, "boolean", "Estado_campus", true);
		msg += validador.validarParametro(args, "cadena", "Descripcion_campus", true);
		msg += validador.validarParametro(args, "boolean", "isFromChangeState", true);

        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }
        
        //condicion de actualizacion campus sin archivos
        //obtengo archivos 
        let documentos = await invoker(
            global.config.serv_mongoDocumentos,
            "documentos/buscarDocumentos",
            {
                database: "gestionProgramas",
                coleccion: "campus",
                documento: {
                    "extras.Cod_campus": parseInt(args.Cod_campus)
                },
            }
        );
       
        //si campus no tiene documentos y cambia de estado false a true desde la funcion changeState, mandar error
        if (documentos.length === 0 && args.Estado_campus === false && args.isFromChangeState === true) {
            res.json(reply.error(`El campus ${args.Descripcion_campus} no es posible activar sin archivos adjuntos.`));
            return
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
                        coleccion: "campus",
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
            coleccion: 'campus',
            extrasKeyCode: 'Cod_campus',
            extrasValueCode: args.Cod_campus,
            extrasKeyDescription: 'nombreCampus',
            extrasValueDescription: args.Descripcion_campus
        });

        //ACTUALIZAR CAMPUS
        
        let newState = args.Estado_campus === true ? false : true

        let params = {
            codigoCampus: parseInt(args.Cod_campus),
            descripcionCampus: args.Descripcion_campus,
            // si hubo un update desde la funcion cambiar estado, 
            // transformo a number variable newState, 
            //sino 
            //transformo a number variable estado campus (caso para update desde modal update)
            estadoCampus: args.isFromChangeState  ? (newState ? 1 : 0) : (args.Estado_campus ? 1 : 0), 
        }

        let updateCampus = await invoker(
            global.config.serv_campus,
            'postgrado/updateCampus',
            params
        );

        response = { dataWasUpdated: updateCampus, dataUpdated: args.Descripcion_campus }
        res.json(reply.ok(response));

    } catch (e) {
        res.json(reply.fatal(e));
    }
}

let logica_deleteCampus = async (req , res) => {
    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "lista", "campusToDelete", true);

        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }

        let campusToDelete = args.campusToDelete;

        for (let i = 0; i < campusToDelete.length; i++) {
            const e = campusToDelete[i];

            let params = {
                codigoCampus: parseInt(e.Cod_campus),
            }

            await invoker(
                global.config.serv_campus,
                'postgrado/deleteCampus',
                params
            );

            let documentos = await invoker(
                global.config.serv_mongoDocumentos,
                "documentos/buscarDocumentos",
                {
                    database: "gestionProgramas",
                    coleccion: "campus",
                    documento: {
                        "extras.Cod_campus": e.Cod_campus
                    },
                }
            );

            for(let d of documentos){
                await invoker(
                    global.config.serv_mongoDocumentos,
                    "documentos/eliminarDocumento",
                    {
                        database: 'gestionProgramas',
                        coleccion: 'campus',
                        id: d.id,
                    }
                );
            }

        }
        let response = { dataWasDeleted: true , dataDeleted: campusToDelete}
        res.json(reply.ok(response));
    } catch (e) {
        res.json(reply.fatal(e));
    }
}

module.exports = {
	getArchivoDocumento,
    getDocumentosWithBinary,
    logica_getCampus,
    logica_insertCampus,
    logica_updateCampus,
    logica_deleteCampus
}