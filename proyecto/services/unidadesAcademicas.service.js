'use strict';
var invoker = require('../../base/invokers/invoker.invoker');
var reply = require('../../base/utils/reply');
var validador = require('../../base/utils/validador');
const uuid = require("uuid");
const reportInvoker = require("../../base/invokers/report.invoker");

// //Se deben llamar a través de una lógica cuando estén listas
// var unidades_academicas = [
//     {
//         "coduni": 1,
//         "descripcion": "Escuela de arquitectura y cine",
//         "codfacu": 1
//     },
//     {
//         "coduni": 2,
//         "descripcion": "Escuela de derecho",
//         "codfacu": 2
//     },
//     {
//         "coduni": 3,
//         "descripcion": "Escuela de medicina",
//         "codfacu": 3
//     },
// ]

//Get de ua con facultad por separado
let bruto_getUnidadesAcad= async (req, res) => {
    try {
        // Crear un mapa para acceder fácilmente a la facultad por Cod_facultad
        let facultades =  await bruto_getFacultades();
        
        let facultadesMap = {};
        facultades.forEach(fac => {
            facultadesMap[fac.Cod_facultad] = fac;
            facultadesMap[fac.Descripcion_facu] = fac;
        });

        // Agregar la facultad a cada unidad académica
        let ua_con_facultades = unidades_academicas.map(ua => ({
            ...ua,
            facultad: facultadesMap[ua.Cod_facultad]
        }));

        // Enviar la respuesta con la información combinada
        res.json(reply.ok(ua_con_facultades));
    } catch (e) {
        res.json(reply.fatal(e));
    }
};

let bruto_insertUnidadesAcad = async (req, res) => {
    
	try {
		let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
		let msg = validador.validarParametro(args, "cadena", "Descripcion_ua", true);
        // msg += validador.validarParametro(args, "lista", "docs", false);

		if (msg != "") {
            res.json(reply.error(msg));
            return;
        }

        let response = {};

        let ultimoObjeto = unidades_academicas[unidades_academicas.length - 1];
        let ultimoCodigo = ultimoObjeto.Cod_unidad_academica;
        let codigoUnidadAcad = ultimoCodigo + 1; 

		let newUnidadAcad = { 
			Cod_unidad_academica: codigoUnidadAcad,
			Descripcion_ua: args.Descripcion_ua,
            Cod_facultad: args.Cod_facultad
		}
		unidades_academicas.push(newUnidadAcad);

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
                        coleccion: "unidades_academicas",
                        documento: {
                            "extras.Cod_unidad_academica": parseInt(codigoUnidadAcad),
                            nombre: doc.nombre,
                        },
                    }
                );
                if (documentoFind.length) {
                    //falló la inserción de doc por lo que se borra el registro recién insertado
                    unidades_academicas = unidades_academicas.filter( unidadAcad => unidadAcad.Cod_unidad_academica !== codigoUnidadAcad)
                    res.json(reply.error(`El documento ${doc.nombre} ya existe.`));
                    return;
                }
                let param = {
                    database: "gestionProgramas",
                    coleccion: "unidades_academicas",
                    id: uuid.v1(),
                    nombre: doc.nombre,
                    dataBase64: doc.archivo,
                    tipo: doc.tipo,
                    extras: {
                        Cod_unidad_academica: parseInt(codigoUnidadAcad),
                        nombreUnidadAcad: doc.extras.Descripcion_ua,
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
                        coleccion: "unidades_academicas",
                        id: result.id,
                    }
                );
                response = { dataWasInserted: newUnidadAcad , dataInserted: args.Descripcion_ua}
            }
        }

		res.json(reply.ok(response));

	} catch (e) {
		res.json(reply.fatal(e));
	}
}

let bruto_updateUnidadesAcad = async (req, res) => {
	try {
		let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "number", "Cod_unidad_academica", true);
		msg += validador.validarParametro(args, "cadena", "Descripcion_ua", true);

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
                            coleccion: "unidades_academicas",
                            documento: {
                                "extras.Cod_unidad_academica": parseInt(args.Cod_unidad_academica),
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
                        coleccion: "unidades_academicas",
                        id: uuid.v1(),
                        nombre: doc.nombre,
                        dataBase64: doc.archivo,
                        tipo: doc.tipo,
                        extras: {
                            Cod_unidad_academica: doc.extras.Cod_unidad_academica,
                            nombreUnidadAcad: doc.extras.Descripcion_ua,
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
                        coleccion: "unidades_academicas",
                        id: doc.id,
                        nombre: doc.nombre,
                        dataBase64: new Buffer.from(doc.dataBase64, "base64"),
                        tipo: doc.tipo,
                        extras: {
                            Cod_unidad_academica: doc.extras.Cod_unidad_academica,
                            nombreUnidadAcad: doc.extras.Descripcion_ua,
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

        // Buscar la unidad académica por ID
        let unidadAcadToUpdate = unidades_academicas.find(c => c.Cod_unidad_academica === args.Cod_unidad_academica);

        if (!unidadAcadToUpdate) {
            res.json(reply.error("Unidad académica no encontrada"));
            return;
        }
        
        // Actualizar la descripción de la unidad academica
        unidadAcadToUpdate.Descripcion_ua = args.Descripcion_ua;

        response = { dataWasUpdated: unidadAcadToUpdate , dataUpdated: args.Descripcion_ua }

		res.json(reply.ok(response));

	} catch (e) {
		res.json(reply.fatal(e));
	}
}

let bruto_deleteUnidadesAcad = async (req, res) => {
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
            unidades_academicas = unidades_academicas.filter( unidadAcad => unidadAcad.Cod_unidad_academica !== e.Cod_unidad_academica)

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

let deleteDoc = async (req, res) => {

    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "cadena","Cod_unidad_academica", true);
 
        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }
 
        let deleteDoc = await invoker(
            global.config.serv_mongoDocumentos,
            "documentos/eliminarDocumento",
            {
                database: "gestionProgramas",
                coleccion: "unidades_academicas",
                id: args.Cod_unidad_academica

            }
        );

        res.json(reply.ok(deleteDoc));
    } catch (e) {
        res.json(reply.fatal(e));
    }
}

//NUEVOS SERVICIOS USANDO LOGICA
let logica_getUnidadesAcademicas = async (req, res) => {
    try {
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

        let facultadesMap = {};
        facultades.forEach(fac => {
            facultadesMap[fac.codigo] = {
                Cod_facultad: fac.codigo,           // Mapeo a la estructura de Facultad
                Descripcion_facu: fac.descripcion,
                Estado: fac.estado   // Mapeo a la estructura de Facultad
            };
        });

        // Mapear las unidades académicas para incluir la facultad
        let ua_con_facultades = unidades_academicas.map(ua => ({
            Cod_unidad_academica: ua.coduni,   // Asume que `coduni` es el identificador
            Descripcion_ua: ua.descripcion,    // Asume que `descripcion` es el nombre
            Cod_facultad: ua.codfacu,          // Asume que `codfacu` es el identificador de la facultad
            facultad: facultadesMap[ua.codfacu] || null  // Asocia la facultad si existe
        }));

        // Enviar la respuesta con la información combinada
        res.json(reply.ok(ua_con_facultades));
    } catch (e) {
        res.json(reply.fatal(e));
    }
};



//INSERT LOGICA pendiente

let logica_insertUnidadesAcademicas = async (req, res) => {
    
	try {
		let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
		let msg = validador.validarParametro(args, "cadena", "Descripcion_ua", true);

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
                        coleccion: "unidades_academicas",
                        documento: {
                            "extras.Cod_unidad_academica": parseInt(codigoUnidadAcad),
                            nombre: doc.nombre,
                        },
                    }
                );
                if (documentoFind.length) {
                    //falló la inserción de doc por lo que se borra el registro recién insertado
                    let params = {
                        codigoUnidadAcad: parseInt(codigoUnidadAcad),
                    }
                    await invoker(
                        global.config.serv_campus,
                        'postgrado/deleteCampus',
                        params
                    );                    
                    res.json(reply.error(`El documento ${doc.nombre} ya existe.`));
                    return;
                }
                let param = {
                    database: "gestionProgramas",
                    coleccion: "unidades_academicas",
                    id: uuid.v1(),
                    nombre: doc.nombre,
                    dataBase64: doc.archivo,
                    tipo: doc.tipo,
                    extras: {
                        Cod_unidad_academica: parseInt(codigoUnidadAcad),
                        nombreUnidadAcad: doc.extras.Descripcion_ua,
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
                        coleccion: "unidades_academicas",
                        id: result.id,
                    }
                );
                response = { insertUnidadAcademica , documento}
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
                            coleccion: "unidades_academicas",
                            documento: {
                                "extras.Cod_unidad_academica": parseInt(args.Cod_unidad_academica),
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
                        coleccion: "unidades_academicas",
                        id: uuid.v1(),
                        nombre: doc.nombre,
                        dataBase64: doc.archivo,
                        tipo: doc.tipo,
                        extras: {
                            Cod_unidad_academica: doc.extras.Cod_unidad_academica,
                            nombreUnidadAcad: doc.extras.Descripcion_ua,
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
                        coleccion: "unidades_academicas",
                        id: doc.id,
                        nombre: doc.nombre,
                        dataBase64: new Buffer.from(doc.dataBase64, "base64"),
                        tipo: doc.tipo,
                        extras: {
                            Cod_unidad_academica: doc.extras.Cod_unidad_academica,
                            nombreUnidadAcad: doc.extras.Descripcion_ua,
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

        let params = {
            codigoUnidad: parseInt(args.Cod_unidad_academica),
			descripcionUnidad: args.Descripcion_ua,
            codigoFacultad: args.Cod_facultad
        }

        // Buscar la unidad académica por ID
        let updateCampus = await invoker(
            global.config.serv_basePostgrado,
            'unidadesAcademicas/updateUnidadesAcademicas',
            params
        );
        
        response = { dataWasUpdated: updateCampus , dataUpdated: args.Descripcion_ua }
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

            await invoker(
                global.config.serv_basePostgrado,
                'unidadesAcademicas/deleteUnidadesAcademicas',
                params
            );

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
    
    bruto_getUnidadesAcad,
    bruto_insertUnidadesAcad,
    bruto_updateUnidadesAcad,
    bruto_deleteUnidadesAcad,

    //mongo
    getDocumentosWithBinary,
    getArchiveDoc,
    deleteDoc,

    // //logicas ua
    logica_getUnidadesAcademicas,
    logica_insertUnidadesAcademicas,
    logica_updateUnidadesAcademicas,
    logica_deleteUnidadesAcademicas,
}