'use strict';
var invoker = require('../../base/invokers/invoker.invoker');
var reply = require('../../base/utils/reply');
var validador = require('../../base/utils/validador');
const uuid = require("uuid");
const reportInvoker = require("../../base/invokers/report.invoker");
const { getRandomColor, getTextColor, badgeColorMapping} = require("../utils/colors.js")

 
var reglamentos = [
        {
            "codreglamento": 1,
            "descripcion": "Reglamento Ejemplo 1",
            "anio": "2017",
            "vigencia": 1, //si 1 no 0
        },
        {
            "codreglamento": 2,
            "descripcion": "Reglamento Ejemplo 2",
            "anio": "2020",
            "vigencia": 1, //si 1 no 0
        },
        {
            "codreglamento": 3,
            "descripcion": "Reglamento Ejemplo 3",
            "anio": "2024",
            "vigencia": 1, //si 1 no 0
        },
        {
            "codreglamento": 4,
            "descripcion": "Reglamento Ejemplo 4",
            "anio": "2024",
            "vigencia": 1, //si 1 no 0
        },
        {
            "codreglamento": 5,
            "descripcion": "Reglamento Ejemplo 5",
            "anio": "2024",
            "vigencia": 1, //si 1 no 0
        },
    ]

let getReglamentos = async (req, res) => {
    try {
        const colorMapping = {};
        reglamentos.forEach(reglamento => {
            const randomColor = getRandomColor();
            if (!colorMapping[reglamento.codreglamento]) {
                colorMapping[reglamento.codreglamento] = badgeColorMapping[reglamento.codreglamento] || { backgroundColor: randomColor, textColor: getTextColor(randomColor) };
            }
        });
 
        let listReglamentos = reglamentos.map( r => {
            return{
                "Cod_reglamento": r.codreglamento,
                "Descripcion_regla" : r.descripcion,
                "anio": r.anio,
                "vigencia": r.vigencia === 1 ? true : false,
                "BadgeClass": colorMapping[r.codreglamento],
            }
        })
        res.json(reply.ok(listReglamentos));

    } catch (e) {
        res.json(reply.fatal(e));
    } 
}

let insertReglamento = async (req, res) => {
    
	try {
		let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
		let msg = validador.validarParametro(args, "cadena", "Descripcion_regla", true);
        //msg += validador.validarParametro(args, "lista", "docs", false);

		if (msg != "") {
            res.json(reply.error(msg));
            return;
        }

        let response = {};

        let ultimoObjeto = reglamentos[reglamentos.length - 1];
        let ultimoCodigo = ultimoObjeto.codreglamento; //id objeto bruto
        let codigoReglamento = ultimoCodigo + 1; 

		let newReglamento = {
			codreglamento: codigoReglamento,
			descripcion: args.Descripcion_regla,
            anio: args.anio,
            vigencia: args.vigencia === true ? 1 : 0
		}
		reglamentos.push(newReglamento);

        if (args.docsToUpload.length != 0) {

            for (let i = 0; i < args.docsToUpload.length; i++) {
                const doc = args.docsToUpload[i];
                //INSERTAR DOCUMENTO
                //Busca si no hay documentos con el mismo nombre
                let documentoFind = await invoker(
                    global.config.serv_mongoDocumentos,
                    "documentos/buscarDocumentos",
                    {
                        database: "gestionProgramas",
                        coleccion: "reglamentos",
                        documento: {
                            "extras.Cod_reglamento": parseInt(codigoReglamento),
                            nombre: doc.nombre,
                        },
                    }
                );
                if (documentoFind.length) {
                    //falló la inserción de doc por lo que se borra el registro recién insertado
                    reglamentos = reglamentos.filter( r => r.Cod_reglamento !== codigoReglamento)
                    res.json(reply.error(`El documento ${doc.nombre} ya existe.`));
                    return;
                }
                let param = {
                    database: "gestionProgramas",
                    coleccion: "reglamentos",
                    id: uuid.v1(),
                    nombre: doc.nombre,
                    dataBase64: doc.archivo,
                    tipo: doc.tipo,
                    extras: {
                        Cod_reglamento: parseInt(codigoReglamento),
                        nombreReglamento: doc.extras.Descripcion_regla,
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
                        coleccion: "reglamentos",
                        id: result.id,
                    }
                );
                response = { dataWasInserted: newReglamento , dataInserted: args.Descripcion_regla}
            }
        }

		res.json(reply.ok(response));

	} catch (error) {
		res.json(reply.fatal(error));
	}
}

let updateReglamento = async (req, res) => {
	try {
		let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "number", "Cod_reglamento", true);
		msg += validador.validarParametro(args, "cadena", "Descripcion_regla", true);

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
                        coleccion: "reglamentos",
                        id: doc.id
        
                    }
                );

                if (!deleteDoc.deleted) {
                    res.json(reply.error(`El documento no pudo ser eliminado.`));
                    return;
                }
            }
        }

        if (args.docsToUpload.length != 0) {
            for (let i = 0; i < args.docsToUpload.length; i++) {
                const doc = args.docsToUpload[i];
                if (!doc.id) {
                    //es un nuevo archivo
                    //buscamos archivos con mismo codigo y nombre
                    let documentoFind = await invoker(
                        global.config.serv_mongoDocumentos,
                        "documentos/buscarDocumentos",
                        {
                            database: "gestionProgramas",
                            coleccion: "reglamentos",
                            documento: {
                                "extras.Cod_reglamento": parseInt(args.Cod_reglamento),
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
                        coleccion: "reglamentos",
                        id: uuid.v1(),
                        nombre: doc.nombre,
                        dataBase64: doc.archivo,
                        tipo: doc.tipo,
                        extras: {
                            Cod_reglamento: doc.extras.Cod_reglamento,
                            nombreReglamento: doc.extras.Descripcion_regla,
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
                        coleccion: "reglamentos",
                        id: doc.id,
                        nombre: doc.nombre,
                        dataBase64: new Buffer.from(doc.dataBase64, "base64"),
                        tipo: doc.tipo,
                        extras: {
                            Cod_reglamento: doc.extras.Cod_reglamento,
                            nombreReglamento: doc.extras.Descripcion_regla,
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


        let reglamentoToUpdate = reglamentos.find(r => r.Cod_reglamento === args.Cod_reglamento);
        //Modificar en bruto
        if (!reglamentoToUpdate) {
            res.json(reply.error("Reglamento no encontrado"));
            return;
        }
        
        // Actualizar descripción de reglamento
        reglamentoToUpdate.Descripcion_regla = args.Descripcion_regla;

        response = { dataWasUpdated: reglamentoToUpdate , dataUpdated: args.Descripcion_regla }

		res.json(reply.ok(response));

	} catch (e) {
		res.json(reply.fatal(e));
	}
}

let deleteReglamentos = async (req, res) => {
    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "lista", "reglamentoToDelete", true);

        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }

        let reglamentoToDelete = args.reglamentoToDelete;
        
        for (let i = 0; i < reglamentoToDelete.length; i++) {
            const e = reglamentoToDelete[i];
            reglamentos = reglamentos.filter( r => r.Cod_reglamento !== e.Cod_reglamento)

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

            for(let d of documentos){
                await invoker(
                    global.config.serv_mongoDocumentos,
                    "documentos/eliminarDocumento",
                    {
                        database: 'gestionProgramas',
                        coleccion: 'reglamentos',
                        id: d.id,
                    }
                );
            }
        }

        let response = { dataWasDeleted: true , dataDeleted: reglamentoToDelete}
        res.json(reply.ok(response));

    } catch (e) {
        res.json(reply.fatal(e));
    }
}

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

let deleteDoc = async (req, res) => {

    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "cadena","Cod_reglamento", true);
 
        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }
 
        let deleteDoc = await invoker(
            global.config.serv_mongoDocumentos,
            "documentos/eliminarDocumento",
            {
                database: "gestionProgramas",
                coleccion: "reglamentos",
                id: args.Cod_reglamento

            }
        );

        res.json(reply.ok(deleteDoc));
    } catch (e) {
        res.json(reply.fatal(e));
    }
}

module.exports = {

    getReglamentos,
    insertReglamento,
    updateReglamento,
    deleteReglamentos,

     //mongo
     getDocumentosWithBinary,
     getArchiveDoc,
     deleteDoc,
}

/*

// if (args.docsToDelete.length != 0) {
//     for (let i = 0; i < args.docsToDelete.length; i++) {
//         const doc = args.docsToDelete[i];
        
//         if (!doc.id) {
//             //es un nuevo archivo
//             //buscamos archivos con mismo codigo y nombre
//             let documentoFind = await invoker(
//                 global.config.serv_mongoDocumentos,
//                 "documentos/buscarDocumentos",
//                 {
//                     database: "gestionProgramas",
//                     coleccion: "reglamentos",
//                     documento: {
//                         "extras.Cod_reglamento": parseInt(args.Cod_reglamento),
//                         nombre: doc.nombre,
//                     },
//                 }
//             );
//             if (documentoFind.length) {
//                 //hay documentos con mismo nombre, se cancela.
//                 res.json(reply.error(`El documento ${doc.nombre} ya existe.`));
//                 return;
//             };
//             let param = {
//                 database: "gestionProgramas",
//                 coleccion: "reglamentos",
//                 id: uuid.v1(),
//                 nombre: doc.nombre,
//                 dataBase64: doc.archivo,
//                 tipo: doc.tipo,
//                 extras: {
//                     Cod_reglamento: doc.extras.Cod_reglamento,
//                     nombreReglamento: doc.extras.Descripcion_regla,
//                     pesoDocumento: doc.extras.pesoDocumento,
//                     comentarios: doc.extras.comentarios,
//                 },
//             };
//             let result = await invoker(
//                 global.config.serv_mongoDocumentos,
//                 "documentos/guardarDocumento",
//                 param
//             );
//             docs.push(result)
//         }else{
//             // no es nuervo archivo, por tanto se actualiza

//             let param = {
//                 database: "gestionProgramas",
//                 coleccion: "reglamentos",
//                 id: doc.id,
//                 nombre: doc.nombre,
//                 dataBase64: new Buffer.from(doc.dataBase64, "base64"),
//                 tipo: doc.tipo,
//                 extras: {
//                     Cod_reglamento: doc.extras.Cod_reglamento,
//                     nombreReglamento: doc.extras.Descripcion_regla,
//                     pesoDocumento: doc.extras.pesoDocumento,
//                     comentarios: doc.extras.comentarios,
//                 },
//             };

//             let result = await invoker(
//                 global.config.serv_mongoDocumentos,
//                 "documentos/actualizarDocumento",
//                 param
//             );

//             docs.push(result)
//         }
//     }
// }

// Buscar reglamento por ID
*/
