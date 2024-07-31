'use strict';
var invoker = require('../../base/invokers/invoker.invoker');
var reply = require('../../base/utils/reply');
var validador = require('../../base/utils/validador');
const uuid = require("uuid");
const decryptToken = require("../../base/utils/decryptToken");

var campus = 
	[
		{
			"id": "1000",
			"estado": 1,
			"nombre": "Valparaíso"
		},
        {
			"id": "2000",
			"estado": 1,
			"nombre": "Santiago"
		},
        {
			"id": "3000",
			"estado": 1,
			"nombre": "San Felipe"
		},
        {
			"id": "4000",
			"estado": 0,
			"nombre": "Melipilla"
		}

	]



let getCampus = async (request, response) => {

    try {
        let transformedCampus = campus.map(c => ({
            ...c,
            estado: c.estado === 1 ? "Activo" : "Desactivo"
        }));
        response.json(reply.ok(transformedCampus));
    } catch (e) {
        response.json(reply.fatal(e));
    }

}

let saveDocs = async (req, res) => {
	try {
		let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "cadena", "idCampus", true);
        msg += validador.validarParametro(args, "cadena", "nombre", true);
        msg += validador.validarParametro(args, "cadena", "archivo", true);
        msg += validador.validarParametro(args, "cadena", "tipo", true);
        msg += validador.validarParametro(args, "cadena", "nombreCampus", true);
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
                    "extras.idCampus": args.idCampus,
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
                idCampus: args.idCampus,
                nombreCampus: args.nombreCampus,
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

module.exports = {
    getCampus,
	saveDocs
}