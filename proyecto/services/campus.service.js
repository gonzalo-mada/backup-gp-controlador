'use strict';
var invoker = require('../../base/invokers/invoker.invoker');
var reply = require('../../base/utils/reply');
var validador = require('../../base/utils/validador');
const uuid = require("uuid");
const decryptToken = require("../../base/utils/decryptToken");

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
            Estado_campus: c.Estado_campus === 1 ? "Activo" : "Desactivo"
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

		if (msg != "") {
            res.json(reply.error(msg));
            return;
        }

		let newCampus = { 
			id: uuid.v1(),
			Descripcion_campus: args.Descripcion_campus,
			Estado_campus: 1
		}
		
		campus.push(newCampus);

		res.json(reply.ok(newCampus));

	} catch (e) {
		res.json(reply.fatal(e));
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
	insertCampus,
	saveDocs
}