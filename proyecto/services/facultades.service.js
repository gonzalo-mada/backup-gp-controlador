'use strict';
var invoker = require('../../base/invokers/invoker.invoker');
var reply = require('../../base/utils/reply');
var validador = require('../../base/utils/validador');
const uuid = require("uuid");
const reportInvoker = require("../../base/invokers/report.invoker");

var facultades = [
    {
        "Cod_facultad": 1,
		"Descripcion_facu": "Ingeniería",
    },
    {
        "Cod_facultad": 2,
		"Descripcion_facu": "Medicina",
    },
    {
        "Cod_facultad": 3,
		"Descripcion_facu": "Arquitectura",
    }
]

let bruto_getFacultades = async (req, res) => {

    try {
        res.json(reply.ok(facultades));
    } catch (e) {
        res.json(reply.fatal(e));
    }
}

let bruto_insertFacultad = async (req, res) => {
    
	try {
		let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
		let msg = validador.validarParametro(args, "number", "Descripcion_facu", true);
        // msg += validador.validarParametro(args, "lista", "docs", false);

		if (msg != "") {
            res.json(reply.error(msg));
            return;
        }

        let response = {};

        let ultimoObjeto = facultades[facultades.length - 1];
        let ultimoCodigo = ultimoObjeto.Cod_facultad;
        let codigoFacultad = ultimoCodigo + 1; 

		let newFacultad = { 
			Cod_facultad: codigoFacultad,
			Descripcion_facu: args.Descripcion_facu,
		}
		facultades.push(newFacultad);

        if (args.docs.length != 0) {

            for (let i = 0; i < args.docs.length; i++) {
                const doc = args.docs[i];
                //INSERTAR DOCUMENTO
                //Busca si no hay documentos con el mismo nombre
                let documentoFind = await invoker(
                    global.config.serv_mongoDocumentos,
                    "documentos/buscarDocumentos",
                    {
                        database: "gestionProgramas",
                        coleccion: "facultades",
                        documento: {
                            "extras.Cod_facultad": parseInt(codigoFacultad),
                            nombre: doc.nombre,
                        },
                    }
                );
                if (documentoFind.length) {
                    //falló la inserción de doc por lo que se borra el registro recién insertado
                    facultades = facultades.filter( facultad => facultad.Cod_facultad !== codigoFacultad)
                    res.json(reply.error(`El documento ${doc.nombre} ya existe.`));
                    return;
                }
                let param = {
                    database: "gestionProgramas",
                    coleccion: "facultades",
                    id: uuid.v1(),
                    nombre: doc.nombre,
                    dataBase64: doc.archivo,
                    tipo: doc.tipo,
                    extras: {
                        Cod_facultad: parseInt(codigoFacultad),
                        nombreFacultad: doc.extras.Descripcion_facu,
                        pesoDocumento: doc.extras.pesoDocumento,
                        comentarios: doc.extras.comentarios,
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
                        coleccion: "facultades",
                        id: result.id,
                    }
                );
                response = { dataWasInserted: newFacultad , dataInserted: args.Descripcion_facu}
            }
        }

		res.json(reply.ok(response));

	} catch (e) {
		res.json(reply.fatal(e));
	}
}

let bruto_updateFacultad = async (req, res) => {
	try {
		let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "number", "Cod_facultad", true);
		msg += validador.validarParametro(args, "cadena", "Descripcion_facu", true);

		if (msg != "") {
            res.json(reply.error(msg));
            return;
        }

        let response = {};
        let docs = [];

        if (args.docs.length != 0) {
            for (let i = 0; i < args.docs.length; i++) {
                const doc = args.docs[i];
                if (!doc.id) {
                    //es un nuevo archivo
                    //buscamos archivos con mismo codigo y nombre
                    let documentoFind = await invoker(
                        global.config.serv_mongoDocumentos,
                        "documentos/buscarDocumentos",
                        {
                            database: "gestionProgramas",
                            coleccion: "facultades",
                            documento: {
                                "extras.Cod_facultad": parseInt(args.Cod_facultad),
                                nombre: doc.nombre,
                            },
                        }
                    );
                    if (documentoFind.length) {
                        //hay documentos con mismo nombre, se cancela.
                        res.json(reply.error(`El documento ${doc.nombre} ya existe.`));
                        return;
                    };
                    let param = {
                        database: "gestionProgramas",
                        coleccion: "facultades",
                        id: uuid.v1(),
                        nombre: doc.nombre,
                        dataBase64: doc.archivo,
                        tipo: doc.tipo,
                        extras: {
                            Cod_facultad: doc.extras.Cod_facultad,
                            nombreFacultad: doc.extras.Descripcion_facu,
                            pesoDocumento: doc.extras.pesoDocumento,
                            comentarios: doc.extras.comentarios,
                        },
                    };
                    let result = await invoker(
                        global.config.serv_mongoDocumentos,
                        "documentos/guardarDocumento",
                        param
                    );
                    docs.push(result)
                }else{
                    // no es nuervo archivo, por tanto se actualiza

                    let param = {
                        database: "gestionProgramas",
                        coleccion: "facultades",
                        id: doc.id,
                        nombre: doc.nombre,
                        dataBase64: new Buffer.from(doc.dataBase64, "base64"),
                        tipo: doc.tipo,
                        extras: {
                            Cod_facultad: doc.extras.Cod_facultad,
                            nombreFacultad: doc.extras.Descripcion_facu,
                            pesoDocumento: doc.extras.pesoDocumento,
                            comentarios: doc.extras.comentarios,
                        },
                    };

                    let result = await invoker(
                        global.config.serv_mongoDocumentos,
                        "documentos/actualizarDocumento",
                        param
                    );

                    docs.push(result)
                }
            }
        }

        // Buscar el facultad por ID
        let facultadToUpdate = facultades.find(c => c.Cod_facultad === args.Cod_facultad);

        if (!facultadToUpdate) {
            res.json(reply.error("Facultad no encontrado"));
            return;
        }
        
        // Actualizar la descripción del facultad
        facultadToUpdate.Descripcion_facu = args.Descripcion_facu;

        response = { dataWasUpdated: facultadToUpdate , dataUpdated: args.Descripcion_facu }

		res.json(reply.ok(response));

	} catch (e) {
		res.json(reply.fatal(e));
	}
}

let bruto_deleteFacultad = async (req, res) => {
    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "lista", "facultadesToDelete", true);

        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }

        let facultadesToDelete = args.facultadesToDelete;
        
        for (let i = 0; i < facultadesToDelete.length; i++) {
            const e = facultadesToDelete[i];
            facultades = facultades.filter( facultad => facultad.Cod_facultad !== e.Cod_facultad)

            let documentos = await invoker(
                global.config.serv_mongoDocumentos,
                "documentos/buscarDocumentos",
                {
                    database: "gestionProgramas",
                    coleccion: "facultades",
                    documento: {
                        "extras.Cod_facultad": e.Cod_facultad
                    },
                }
            );

            for(let d of documentos){
                await invoker(
                    global.config.serv_mongoDocumentos,
                    "documentos/eliminarDocumento",
                    {
                        database: 'gestionProgramas',
                        coleccion: 'facultades',
                        id: d.id,
                    }
                );
            }
        }

        let response = { dataWasDeleted: true , dataDeleted: facultadesToDelete}
        res.json(reply.ok(response));

    } catch (e) {
        res.json(reply.fatal(e));
    }
}

//mongo

let getDocumentosWithBinary = async (req, res) => {

    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "cadena","Cod_facultad", true);
 
        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }
 
        let documentos = await invoker(
            global.config.serv_mongoDocumentos,
            "documentos/buscarDocumentos",
            {
                database: "gestionProgramas",
                coleccion: "facultades",
                documento: {
                    "extras.Cod_facultad": parseInt(args.Cod_facultad)
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
                    coleccion: "facultades",
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
                coleccion: "facultades",
                id: args.id,
            }
        );

        res.send(archivo);
    } catch (e) {
        res.json(reply.fatal(e));
    }
};

let deleteDoc = async (req, res) => {

    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "cadena","Cod_facultad", true);
 
        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }
 
        let deleteDoc = await invoker(
            global.config.serv_mongoDocumentos,
            "documentos/eliminarDocumento",
            {
                database: "gestionProgramas",
                coleccion: "facultades",
                id: args.Cod_facultad

            }
        );

        res.json(reply.ok(deleteDoc));
    } catch (e) {
        res.json(reply.fatal(e));
    }
}


module.exports = {
    bruto_getFacultades,
    bruto_insertFacultad,
    bruto_updateFacultad,
    bruto_deleteFacultad,

    //mongo
    getDocumentosWithBinary,
    getArchiveDoc,
    deleteDoc


}