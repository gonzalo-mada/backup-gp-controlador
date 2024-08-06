'use strict';
var invoker = require('../../base/invokers/invoker.invoker');
var reply = require('../../base/utils/reply');
var validador = require('../../base/utils/validador');
const uuid = require("uuid");
const decryptToken = require("../../base/utils/decryptToken");
const reportInvoker = require("../../base/invokers/report.invoker");

var campus = 
	[
		{
			"Cod_campus": "1000",
			"Descripcion_campus": "Valparaíso",
			"Estado_campus": 1,
		},
        {
			"Cod_campus": "2000",
			"Descripcion_campus": "Santiago",
			"Estado_campus": 1,
		},
        {
			"Cod_campus": "3000",
			"Descripcion_campus": "San Felipe",
			"Estado_campus": 1,
		},
        {
			"Cod_campus": "4000",
			"Descripcion_campus": "Melipilla",
			"Estado_campus": 0,
		}

	]



let getCampus = async (req, res) => {

    try {
        let transformedCampus = campus.map(c => ({
            ...c,
            Estado_campus: c.Estado_campus === 1 ? true : false
        }));
        res.json(reply.ok(transformedCampus));
    } catch (e) {
        res.json(reply.fatal(e));
    }
}

let insertCampus = async (req, res) => {
    
	try {
		let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
		let msg = validador.validarParametro(args, "cadena", "Descripcion_campus", true);
        msg += validador.validarParametro(args, "boolean", "Estado_campus", true);

		if (msg != "") {
            res.json(reply.error(msg));
            return;
        }

		let newCampus = { 
			Cod_campus: uuid.v1(),
			Descripcion_campus: args.Descripcion_campus,
			Estado_campus: args.Estado_campus == true ? 1 : 0
		}
		
		campus.push(newCampus);

		res.json(reply.ok(newCampus));

	} catch (e) {
		res.json(reply.fatal(e));
	}
}

let updateCampus = async (req, res) => {
	try {
		let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "cadena", "Cod_campus", true);
		msg += validador.validarParametro(args, "boolean", "Estado_campus", true);
		msg += validador.validarParametro(args, "cadena", "Descripcion_campus", true);

		if (msg != "") {
            res.json(reply.error(msg));
            return;
        }

        // Buscar el campus por ID
        let campusToUpdate = campus.find(c => c.Cod_campus === args.Cod_campus);

        if (!campusToUpdate) {
            res.json(reply.error("Campus no encontrado"));
            return;
        }

        // Actualizar la descripción del campus
        campusToUpdate.Descripcion_campus = args.Descripcion_campus;
        campusToUpdate.Estado_campus = args.Estado_campus == true ? 1 : 0;

		res.json(reply.ok(campusToUpdate));

	} catch (e) {
		res.json(reply.fatal(e));
	}
}

let deleteCampusSingular = async (req, res) => {
    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "cadena", "Cod_campus", true);
 
        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }
        
        if (['1000', '2000', '3000', '4000'].includes(args.Cod_campus)) {
            res.json(reply.fatal("No se puede eliminar un campus en uso"));
            return;
        }
        else{

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
    
           
            //Ciclo iterativo para eliminar archivos con el id campus asociado
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
    
            //eliminación en bruto
            campus = campus.filter(campus => campus.Cod_campus !== args.Cod_campus);
            res.json(reply.ok());
     
        }
       
    } catch (e) {
        res.json(reply.fatal(e));
    }
}


//mongo
let saveDocs = async (req, res) => {
	try {
		let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "cadena", "Cod_campus", true);
        msg += validador.validarParametro(args, "cadena", "nombre", true);
        msg += validador.validarParametro(args, "cadena", "archivo", true);
        msg += validador.validarParametro(args, "cadena", "tipo", true);
        msg += validador.validarParametro(args, "cadena", "Descripcion_campus", true);
        msg += validador.validarParametro( args, "cadena", "pesoDocumento", true);
        msg += validador.validarParametro(args, "cadena", "comentarios", false);

		if (msg != "") {
            res.json(reply.error(msg));
            return;
        }

		//Busca si no hay documentos con el mismo nombre para la misma pasantia
        let documentoFind = await invoker(
            global.config.serv_mongoDocumentos,
            "documentos/buscarDocumentos",
            {
                database: "gestionProgramas",
                coleccion: "campus",
                documento: {
                    "extras.Cod_campus": args.Cod_campus,
                    nombre: args.nombre,
                },
            }
        );

        if (documentoFind.length) {
            res.json(reply.error(`El documento ${args.nombre} ya existe.`));
            return;
        }

		let param = {
            database: "gestionProgramas",
            coleccion: "campus",
            id: uuid.v1(),
            nombre: args.nombre,
            dataBase64: args.archivo,
            tipo: args.tipo,
            extras: {
                Cod_campus: args.Cod_campus,
                nombreCampus: args.Descripcion_campus,
                pesoDocumento: args.pesoDocumento,
                comentarios: args.comentarios,
            },
        };

		let result = await invoker(
            global.config.serv_mongoDocumentos,
            "documentos/guardarDocumento",
            param
        );

		let documento = await invoker(
            global.config.serv_mongoDocumentos,
            "documentos/obtenerDocumento",
            {
                database: "gestionProgramas",
                coleccion: "campus",
                id: result.id,
            }
        );

		//TODO: logs 
        

		res.json(reply.ok(documento));
	} catch (e) {
		res.json(reply.fatal(e));
	}
}

let updateDocs = async (req, res) => {
	try {
		let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "cadena", "Cod_campus", true);
        msg += validador.validarParametro(args, "cadena", "id", true);
        msg += validador.validarParametro(args, "cadena", "nombre", true);
        msg += validador.validarParametro(args, "cadena", "dataBase64", true);
        msg += validador.validarParametro(args, "cadena", "tipo", true);
        msg += validador.validarParametro(args, "cadena", "Descripcion_campus", true);
        msg += validador.validarParametro( args, "cadena", "pesoDocumento", true);
        msg += validador.validarParametro(args, "cadena", "comentarios", false);

		if (msg != "") {
            res.json(reply.error(msg));
            return;
        }

        //TODO: ARREGLAR EN CASO DE QUE SUBA EL MISMO ARCHIVO
		//Busca si no hay documentos con el mismo nombre para el mismo campus
        // let documentoFind = await invoker(
        //     global.config.serv_mongoDocumentos,
        //     "documentos/buscarDocumentos",
        //     {
        //         database: "gestionProgramas",
        //         coleccion: "campus",
        //         documento: {
        //             "extras.Cod_campus": args.Cod_campus,
        //             nombre: args.nombre,
        //         },
        //     }
        // );

        // if (documentoFind.length) {
        //     res.json(reply.error(`El documento ${args.nombre} ya existe.`));
        //     return;
        // }

        let param = {
            database: "gestionProgramas",
            coleccion: "campus",
            id: args.id,
            nombre: args.nombre,
            dataBase64: args.dataBase64,
            tipo: args.tipo,
            extras: {
                Cod_campus: args.Cod_campus,
                nombreCampus: args.Descripcion_campus,
                pesoDocumento: args.pesoDocumento,
                comentarios: args.comentarios,
            },
        };

        let result = await invoker(
            global.config.serv_mongoDocumentos,
            "documentos/actualizarDocumento",
            param
        );

        

		res.json(reply.ok(result));
	} catch (e) {
		res.json(reply.fatal(e));
	}
}

let getDocumentosCampus = async (req, res) => {
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
        res.json(reply.ok(documentos));
    } catch (e) {
        res.json(reply.fatal(e));
    }
}


let getDocumentosWithBinaryCampus = async (req, res) => {

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

        let binaryDocumento = await reportInvoker(
            global.config.serv_mongoDocumentos,
            "documentos/obtenerArchivoDocumento",
            {
                database: "gestionProgramas",
                coleccion: "campus",
                id: args.Cod_campus
            }
        );

        let documentoString = binaryDocumento.toString('base64');

        documentos.forEach(doc => {
            doc.dataBase64 = documentoString;  // Agrega el campo documentoString al documento
        });
        
        res.json(reply.ok(documentos));
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

let deleteDocCampus = async (req, res) => {

    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "cadena","Cod_campus", true);
 
        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }
 
        let deleteDoc = await invoker(
            global.config.serv_mongoDocumentos,
            "documentos/eliminarDocumento",
            {
                database: "gestionProgramas",
                coleccion: "campus",
                id: args.Cod_campus

            }
        );

        res.json(reply.ok(deleteDoc));
    } catch (e) {
        res.json(reply.fatal(e));
    }
}



module.exports = {
    getCampus,
	insertCampus,
    updateCampus,
	getArchivoDocumento,
	getDocumentosCampus,
    getDocumentosWithBinaryCampus,
	saveDocs,
    updateDocs,
    deleteDocCampus,
    deleteCampusSingular
}