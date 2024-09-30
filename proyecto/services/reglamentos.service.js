'use strict';
var invoker = require('../../base/invokers/invoker.invoker');
var reply = require('../../base/utils/reply');
var validador = require('../../base/utils/validador');
const uuid = require("uuid");
const reportInvoker = require("../../base/invokers/report.invoker");
const { getRandomColor, getTextColor, badgeColorMapping} = require("../utils/colors.js");
const { insertDocs } = require('../utils/gpUtils.js');

 
var reglamentos = [
        {
            "idReglamento": 1,
            "descripcionRegla": "Reglamento Ejemplo 1",
            "anio": "2017",
            "vigencia": 'SI', //si 1 no 0
        },
        {
            "id": 2,
            "descripcion": "Reglamento Ejemplo 2",
            "anio": "2020",
            "vigencia": 'SI', //si 1 no 0
        },
        {
            "id": 3,
            "descripcion": "Reglamento Ejemplo 3",
            "anio": "2024",
            "vigencia": 'Si', //si 1 no 0
        },
        {
            "id": 4,
            "descripcion": "Reglamento Ejemplo 4",
            "anio": "2024",
            "vigencia": 'SI', //si 1 no 0
        },
        {
            "id": 5,
            "descripcion": "Reglamento Ejemplo 5",
            "anio": "2024",
            "vigencia": 'SI', //si 1 no 0
        },
    ]

let getReglamentos = async (req, res) => {
    try {
        const colorMapping = {};
        // Obtener unidades académicas
        let reglamentos = await invoker(
            global.config.serv_basePostgrado,
            'reglamento/getReglamento',
            null
        );
        console.log(reglamentos);
        
        reglamentos.forEach(reglamento => {
            const randomColor = getRandomColor();
            if (!colorMapping[reglamento.id]) {
                colorMapping[reglamento.id] = badgeColorMapping[reglamento.id] || { backgroundColor: randomColor, textColor: getTextColor(randomColor) };
            }
        });
 
        let listReglamentos = reglamentos.map( r => {
            return{
                "Cod_reglamento": r.id,
                "Descripcion_regla" : r.descripcion,
                "anio": r.anio,
                "vigencia": r.vigencia === 'SI' ? true : false,
                "BadgeClass": colorMapping[r.id],
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

        if (msg != "") {
            res.json(reply.error(msg));
            return;
        };

        let reglamentos = await invoker(
            global.config.serv_basePostgrado,
            'reglamento/getReglamento',
            null
        );

        let response = {};


        let reglaExist = reglamentos.some(r => 
            String(r.descripcion).toLowerCase() === String(args.Descripcion_regla).toLowerCase()
        );

        if (reglaExist) {
            return res.json(reply.error(`El reglamento ${args.Descripcion_regla} ya existe.`));
        }

        let ultimoObjeto = reglamentos[reglamentos.length - 1];
        let ultimoCodigo = ultimoObjeto.id;
        let codigoReglamento = ultimoCodigo + 1; 

        let params = {
            idReglamento: parseInt(codigoReglamento),
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
                    arrayDocs: args.docsToUpload.map(doc => {
                        const buffer = Buffer.from(doc.archivo, 'base64');
                        
                        return {
                            nombre: doc.nombre,
                            tipo: doc.tipo,
                            archivo: buffer,
                            extras: {
                                comentarios: doc.extras.comentarios,
                                pesoDocumento: doc.extras.pesoDocumento
                            }
                        };
                    }),
                    coleccion: 'reglamentos',
                    extrasKeyCode: Cod_reglamento,
                    extrasValueCode: codigoReglamento,
                    extrasKeyDescription: 'nombreReglamento',
                    extrasValueDescription: args.Descripcion_regla
                })
            } catch (error) {
            let params = {
                    idReglamento: parseInt(codigoReglamento),
                };
                await invoker(
                    global.config.serv_basePostgrado,
                    'reglamento/deleteReglamento',
                    params
                );
                return res.json(reply.error(`Error al insertar documento: ${error.message}`));
            }
        }

        response = { dataWasInserted: insertReglamento, dataInserted: args.Descripcion_regla };
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

        let response = {};

        // Eliminar documentos si es necesario
        if (args.docsToDelete && args.docsToDelete.length > 0) {
            for (let doc of args.docsToDelete) {
                let deleteDoc = await invoker(
                    global.config.serv_mongoDocumentos,
                    "documentos/eliminarDocumento",
                    {
                        database: "gestionProgramas",
                        coleccion: "reglamentos",
                        id: doc.id // Asumimos que el documento tiene un ID único para eliminar.
                    }
                );

                if (!deleteDoc.deleted) {
                    return res.json(reply.error(`El documento ${doc.nombre} no pudo ser eliminado.`));
                }
            }
        }

        // Subir y actualizar documentos
        let uploadedDocsResponse = {};
        if (args.docsToUpload && args.docsToUpload.length > 0) {
            uploadedDocsResponse = await new Promise((resolve, reject) => {
                updateDocs({
                    arrayDocs: args.docsToUpload,
                    coleccion: 'reglamentos',
                    extrasKeyCode: 'Cod_reglamento',
                    extrasValueCode: args.Cod_reglamento,
                    extrasKeyDescription: 'nombreReglamento',
                    extrasValueDescription: args.Descripcion_regla
                }).then(resolve).catch(reject);
            });
        }

        // Actualizar reglamento
        let params = {
            codigoReglamento: parseInt(args.Cod_reglamento),
            descripcionReglamento: args.Descripcion_regla,
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

        response = { dataWasUpdated: updateReglamento, dataUpdated: args.Descripcion_regla, uploadedDocsResponse };
        return res.json(reply.ok(response));

    } catch (error) {
        return res.json(reply.fatal(error));
    }
};


// let insertReglamento = async (req, res) => {
//     try {
//         let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
//         let msg = validador.validarParametro(args, "cadena", "Descripcion_regla", true);
        
//         if (msg !== "") {
//             return res.json(reply.error(msg));
//         }

//         let response = {};

//         // Verificar si ya existe un reglamento con la misma descripción
//         let reglamentos = await invoker(
//             global.config.serv_basePostgrado,
//             'reglamento/getReglamento',
//             null
//         );

//         let reglaExist = reglamentos.some(r => 
//             String(r.descripcion).toLowerCase() === String(args.Descripcion_regla).toLowerCase()
//         );

//         if (reglaExist) {
//             return res.json(reply.error(`El reglamento ${args.Descripcion_regla} ya existe.`));
//         }

//         // Generar un nuevo código de reglamento
//         let ultimoObjeto = reglamentos[reglamentos.length - 1];
//         let ultimoCodigo = ultimoObjeto.id;
//         let codigoReglamento = ultimoCodigo + 1; 

//         let params = {
//             idReglamento: parseInt(codigoReglamento),
//             descripcionRegla: args.Descripcion_regla,
//             anio: args.anio,
//             vigencia: args.vigencia === true ? 'SI' : 'NO'
//         };

//         let insertReglamento = await invoker(
//             global.config.serv_basePostgrado,
//             'reglamento/insertReglamento',
//             params
//         );

//         if (!insertReglamento) {
//             return res.json(reply.error(`El reglamento no pudo ser creado.`));
//         } else {
//             try {
//                 // Insertar documentos relacionados al reglamento
//                 await insertDocs({
//                     arrayDocs: args.docsToUpload.map(doc => {
//                         // Aquí convertimos el archivo base64 a un Buffer
//                         const buffer = Buffer.from(doc.archivo, 'base64');
                        
//                         // Suponiendo que tu esquema de MongoDB requiere el archivo en un campo separado
//                         return {
//                             nombre: doc.nombre,
//                             tipo: doc.tipo,
//                             archivo: buffer, // O guarda el archivo en un lugar físico y guarda la ruta
//                             extras: {
//                                 comentarios: doc.extras.comentarios,
//                                 pesoDocumento: doc.extras.pesoDocumento
//                             }
//                         };
//                     }),
//                     coleccion: 'reglamentos',
//                     extrasKeyCode: 'Cod_reglamento',
//                     extrasValueCode: codigoReglamento,
//                     extrasKeyDescription: 'nombreReglamento',
//                     extrasValueDescription: args.Descripcion_regla
//                 });
//             } catch (error) {
//                 let params = {
//                     idReglamento: parseInt(codigoReglamento),
//                 };
//                 await invoker(
//                     global.config.serv_basePostgrado,
//                     'reglamento/deleteReglamento',
//                     params
//                 );
//                 return res.json(reply.error(`Error al insertar documento: ${error.message}`));
//             }
//         }

//         response = { dataWasInserted: insertReglamento, dataInserted: args.Descripcion_regla };
//         return res.json(reply.ok(response));

//     } catch (error) {
//         return res.json(reply.fatal(error));
//     }
// };


// let updateReglamento = async (req, res) => {
//     try {
//         let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
//         let msg = validador.validarParametro(args, "number", "Cod_reglamento", true);
//         msg += validador.validarParametro(args, "cadena", "Descripcion_regla", true);
//         msg += validador.validarParametro(args, "number", "anio", true); // Validar el año si es necesario.
//         msg += validador.validarParametro(args, "boolean", "vigencia", true); // Validar la vigencia como true o false.

//         if (msg !== "") {
//             res.json(reply.error(msg));
//             return;
//         }

//         let response = {};
//         let docs = [];

//         // Eliminar documentos si es necesario
//         if (args.docsToDelete && args.docsToDelete.length > 0) {
//             for (let doc of args.docsToDelete) {
//                 let deleteDoc = await invoker(
//                     global.config.serv_mongoDocumentos,
//                     "documentos/eliminarDocumento",
//                     {
//                         database: "gestionProgramas",
//                         coleccion: "reglamentos",
//                         id: doc.id // Asumimos que el documento tiene un ID único para eliminar.
//                     }
//                 );

//                 if (!deleteDoc.deleted) {
//                     res.json(reply.error(`El documento ${doc.nombre} no pudo ser eliminado.`));
//                     return;
//                 }
//             }
//         }

//         // Subir y actualizar documentos
//         if (args.docsToUpload && args.docsToUpload.length > 0) {
//             await updateDocs({
//                 arrayDocs: args.docsToUpload,
//                 coleccion: 'reglamentos',
//                 extrasKeyCode: 'Cod_reglamento',
//                 extrasValueCode: args.Cod_reglamento,
//                 extrasKeyDescription: 'nombreReglamento',
//                 extrasValueDescription: args.Descripcion_regla
//             });
//         }

//         // Actualizar reglamento
//         let params = {
//             codigoReglamento: parseInt(args.Cod_reglamento),
//             descripcionReglamento: args.Descripcion_regla,
//             anio: args.anio,
//             vigencia: args.vigencia === true ? 'SI' : 'NO'
//         };

//         let updateReglamento = await invoker(
//             global.config.serv_basePostgrado,
//             'reglamento/updateReglamento',
//             params
//         );

//         if (!updateReglamento) {
//             res.json(reply.error(`El reglamento no pudo ser actualizado.`));
//             return;
//         }

//         response = { dataWasUpdated: updateReglamento, dataUpdated: args.Descripcion_regla };
//         res.json(reply.ok(response));

//     } catch (error) {
//         res.json(reply.fatal(error));
//     }
// };


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

     //mongo
     getDocumentosWithBinary,
     getArchiveDoc,
     deleteDoc,

     //logicas
     getReglamentos,
     insertReglamento,
     updateReglamento,
     deleteReglamentos,
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



// let updateReglamento = async (req, res) => {
//     try {
//         let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
//         let msg = validador.validarParametro(args, "number", "Cod_reglamento", true);
//         msg += validador.validarParametro(args, "cadena", "Descripcion_regla", true);
//         msg += validador.validarParametro(args, "number", "anio", true); // Si es necesario validar el año.
//         msg += validador.validarParametro(args, "boolean", "vigencia", true); // Para la vigencia como true o false.
        
//         if (msg != "") {
//             res.json(reply.error(msg));
//             return;
//         }

//         let response = {};
        
//         // Eliminar documentos
//         if (args.docsToDelete.length != 0) {
//             for (let i = 0; i < args.docsToDelete.length; i++) {
//                 const doc = args.docsToDelete[i];
//                 let deleteDoc = await invoker(
//                     global.config.serv_mongoDocumentos,
//                     "documentos/eliminarDocumento",
//                     {
//                         database: "gestionProgramas",
//                         coleccion: "reglamentos",
//                         id: doc.id
//                     }
//                 );
//                 if (!deleteDoc.deleted) {
//                     res.json(reply.error(`El documento no pudo ser eliminado.`));
//                     return;
//                 }
//             }
//         }

//         // Subir y actualizar documentos
//         await updateDocs({
//             arrayDocs: args.docsToUpload,
//             coleccion: 'reglamentos',
//             extrasKeyCode: 'Cod_reglamento',
//             extrasValueCode: args.Cod_reglamento,
//             extrasKeyDescription: 'nombreReglamento',
//             extrasValueDescription: args.Descripcion_regla
//         });

//         // Actualizar reglamento
//         let params = {
//             idReglamento: parseInt(codigoReglamento),
// 			descripcionRegla: args.Descripcion_regla,
//             anio: args.anio,
//             vigencia: args.vigencia === true ? 'SI' : 'NO'
//         };

//         let updateReglamento = await invoker(
//             global.config.serv_basePostgrado,
//             'reglamento/updateReglamento',
//             params
//         );

//         if (!updateReglamento) {
//             res.json(reply.error(`El reglamento no pudo ser actualizado.`));
//             return;
//         }

//         response = { dataWasUpdated: updateReglamento, dataUpdated: args.Descripcion_regla };
//         res.json(reply.ok(response));

//     } catch (e) {
//         res.json(reply.fatal(e));
//     }
// }


// let deleteReglamentos = async (req, res) => {
//     try {
//         let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
//         let msg = validador.validarParametro(args, "lista", "reglamentoToDelete", true);

//         if (msg != "") {
//             res.json(reply.error(msg));
//             return;
//         }

//         let reglamentoToDelete = args.reglamentoToDelete;

//         for (let i = 0; i < reglamentoToDelete.length; i++) {
//             const e = reglamentoToDelete[i];

//             let params = {
//                 cod_reglamento: parseInt(e.Cod_reglamento),
//             };

//             let deleteRegla = await invoker(
//                 global.config.serv_basePostgrado,
//                 'reglamento/deleteReglamento',
//                 params
//             );

//             if (!deleteRegla) {
//                 res.json(reply.error(`El reglamento con código ${e.Cod_reglamento} no pudo ser eliminado.`));
//                 return;
//             }

//             let documentos = await invoker(
//                 global.config.serv_mongoDocumentos,
//                 "documentos/buscarDocumentos",
//                 {
//                     database: "gestionProgramas",
//                     coleccion: "reglamentos",
//                     documento: {
//                         "extras.Cod_reglamento": e.Cod_reglamento
//                     },
//                 }
//             );

//             for (let d of documentos) {
//                 await invoker(
//                     global.config.serv_mongoDocumentos,
//                     "documentos/eliminarDocumento",
//                     {
//                         database: 'gestionProgramas',
//                         coleccion: 'reglamentos',
//                         id: d.id,
//                     }
//                 );
//             }
//         }

//         let response = { dataWasDeleted: true, dataDeleted: reglamentoToDelete };
//         res.json(reply.ok(response));

//     } catch (e) {
//         res.json(reply.fatal(e));
//     }
// }


