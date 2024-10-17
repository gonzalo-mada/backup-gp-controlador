const uuid = require("uuid");
var invoker = require('../../base/invokers/invoker.invoker');
var decryptToken = require("../../base/utils/decryptToken");

const getNextCodigo = (data, atributo) => {
    // console.log("data getNextCodigo",data);
    // console.log("atributo getNextCodigo",atributo);
    
    try {
        if (!data || data.length === 0) {
            //si no hay datos, se devuelve 1
            return 1;
        }

        //obtengo ultimo valor
        let last_value = data[data.length - 1];

        //obtengo ultimo codigo
        let last_code = last_value[atributo];
        
        if (isNaN(last_code)) {
            throw new Error(`El último codigo no es un número`);
        }

        return parseInt(last_code) + 1 ;
    } catch (e) {
        throw e;
    }
}

const insertDocs = async ({arrayDocs, coleccion, extrasKeyCode, extrasValueCode, extrasKeyDescription, extrasValueDescription}) => {
    if (!arrayDocs || arrayDocs.length == 0) {
        return;
    }
    let arrayDocsInserted = [];

    try {
        for (let i = 0; i < arrayDocs.length; i++) {
            const doc = arrayDocs[i];

            const startTotal = performance.now(); // Inicia el contador total

            // Medir el tiempo solo para `documentoFind`
            const startFind = performance.now(); // Inicia el contador para la búsqueda

            // Busca si no hay documentos con el mismo nombre para el registro
            let documentoFind = await invoker(
                global.config.serv_mongoDocumentos,
                "documentos/buscarDocumentos",
                {
                    database: "gestionProgramas",
                    coleccion: coleccion,
                    documento: {
                        [`extras.${extrasKeyCode}`]: parseInt(extrasValueCode),
                        nombre: doc.nombre,
                    },
                }
            );

            const endFind = performance.now(); // Finaliza el contador para la búsqueda
            const timeTakenFind = endFind - startFind; // Tiempo en milisegundos para `documentoFind`
            // console.log(`Tiempo para buscar documento ${doc.nombre}: ${timeTakenFind.toFixed(2)} ms`);

            if (documentoFind.length) {
                // Retorna un error para manejarlo en el servicio que llama a esta función
                const errorObject = { message: `El documento ${doc.nombre} ya existe.` }
                throw errorObject;
            }

            // Parámetros para guardar el documento
            let params;
            params = {
                database: "gestionProgramas",
                coleccion: coleccion,
                id: uuid.v1(),
                nombre: doc.nombre,
                dataBase64: doc.archivo,
                tipo: doc.tipo,
                extras: {
                    [extrasKeyCode]: parseInt(extrasValueCode),
                    [extrasKeyDescription]: extrasValueDescription,
                    pesoDocumento: doc.extras.pesoDocumento,
                    comentarios: doc.extras.comentarios,
                },
            };

            // Guardar el documento
            let result = await invoker(
                global.config.serv_mongoDocumentos,
                "documentos/guardarDocumento",
                params
            );

            const endTotal = performance.now(); // Finaliza el contador total
            const timeTakenTotal = endTotal - startTotal; // Tiempo en milisegundos para la operación completa
            // console.log(`Tiempo total para insertar el documento ${doc.nombre}: ${timeTakenTotal.toFixed(2)} ms`);
            arrayDocsInserted.push(result)
        }
        let response = {
            status: true,
            docsInserted: arrayDocsInserted
        }
        return response;
    } catch (error) {
        if (arrayDocsInserted.length !== 0) {
            //SI HAY UN ERROR AL INSERTAR DOCUMENTOS, RECORRO LOS QUE ALCANZARON A INSERTARSE Y LOS ELIMINO
            await deleteDocs({
                arrayDocs: arrayDocsInserted,
                coleccion: coleccion
            })
        }
        throw error;
    }

};

const updateDocs = async ({arrayDocs , coleccion, extrasKeyCode, extrasValueCode, extrasKeyDescription , extrasValueDescription}) => {
    if (!arrayDocs || arrayDocs.length == 0) {
        return;
    }
    let arrayDocsUpdated = [];
    let arrayDocsInsertedFromUpdate = []
    try {
        for (let i = 0; i < arrayDocs.length; i++) {
            const doc = arrayDocs[i];
            
            if (i === 1) {
                const errorObject = { message: `Error intencional` }
                throw errorObject;
            }
            if (!doc.id) {
                //es un nuevo archivo
                let docInsertedFromUpdate = await insertDocs({
                    arrayDocs: [doc],
                    coleccion: coleccion,
                    extrasKeyCode: extrasKeyCode,
                    extrasValueCode: extrasValueCode,
                    extrasKeyDescription: extrasKeyDescription,
                    extrasValueDescription: extrasValueDescription
                });
                let docUpdF = { id: docInsertedFromUpdate.docsInserted[0].id }
                arrayDocsInsertedFromUpdate.push(docUpdF)
            }else{
                let params;
                params = {
                    database: "gestionProgramas",
                    coleccion: coleccion,
                    id: doc.id,
                    nombre: doc.nombre,
                    dataBase64: new Buffer.from(doc.dataBase64, "base64"),
                    tipo: doc.tipo,
                    extras: {
                        [extrasKeyCode]: extrasValueCode,
                        [extrasKeyDescription]: extrasValueDescription,
                        pesoDocumento: doc.extras.pesoDocumento,
                        comentarios: doc.extras.comentarios,
                    }
                };
    
                let result = await invoker(
                    global.config.serv_mongoDocumentos,
                    "documentos/actualizarDocumento",
                    params
                );
                if (result.modified) {
                    let docUpd = { id: doc.id }
                    arrayDocsUpdated.push(docUpd)
                }
            }
        }
        let response = {
            status: true,
            docsUpdated: arrayDocsUpdated,
            docsInserted: arrayDocsInsertedFromUpdate
        }
        return response
    } catch (error) {
        let newDocsWasEliminated = false
        if (arrayDocsInsertedFromUpdate.length !== 0) {
            newDocsWasEliminated = true
            //SI HAY UN ERROR AL INSERTAR DOCUMENTOS NUEVOS, RECORRO LOS QUE ALCANZARON A INSERTARSE Y LOS ELIMINO
            await deleteDocs({
                arrayDocs: arrayDocsInsertedFromUpdate,
                coleccion: coleccion
            })
        }
        let response = {
            newDocsWasEliminated: newDocsWasEliminated,
            error: error
        }
        throw response;
    }

}

const deleteDocs = async ({arrayDocs, coleccion}) => {
    if (!arrayDocs || arrayDocs.length == 0) {
        return;
    }

    try {
        for (let i = 0; i < arrayDocs.length; i++) {
            const doc = arrayDocs[i];
            let deleteDoc = await invoker(
                global.config.serv_mongoDocumentos,
                "documentos/eliminarDocumento",
                {
                    database: "gestionProgramas",
                    coleccion: coleccion,
                    id: doc.id
                }
            );
        }
    } catch (error) {
        throw error;
    }
}

const formatDateGp = (dateString) => {   
    const date = new Date(dateString);

    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = String(date.getUTCFullYear()); 
    
    return `${day}-${month}-${year}`;
}

const formatDateTimeGp = (dateString) => {
    // console.log("dateString",dateString);
       
    const date = new Date(dateString);

    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = String(date.getUTCFullYear());
    
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

const insertLogPrograma = async (req, Cod_Programa, descripcion, tipo_movimiento) => {
    try {
        const token = req.headers.authorization;
        const dataDecrypt = await decryptToken(token);

        let fechaSantiago = new Date().toLocaleString('sv-SE', {
            timeZone: 'America/Santiago',
            hour12: false,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).replace(" ", "T"); // Formato ISO 8601

        let params = {
            "Cod_Programa" : Cod_Programa,
            "descripcion" : descripcion,
            "fecha" : fechaSantiago,
            "tipo_movimiento" : tipo_movimiento,
            "usuario" : dataDecrypt.rut,
            "nombre_usuario" : dataDecrypt.nombreCompleto,
            "correo_usuario" : dataDecrypt.correouv || dataDecrypt.mail,
        }

        let logPrograma = await invoker(
            global.config.serv_basePostgrado,
            'programa/insertLogPrograma',
            params
        );

        if (logPrograma) {
            return true
        }else{
            return false
        }

    } catch (error) {
        throw error
    }
}

module.exports = { 
    getNextCodigo, 
    insertDocs, 
    updateDocs, 
    deleteDocs,
    formatDateGp,
    formatDateTimeGp,
    insertLogPrograma 
};