const uuid = require("uuid");
var invoker = require('../../base/invokers/invoker.invoker');

const getNextCodigo = (data, atributo) => {
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

    for (let i = 0; i < arrayDocs.length; i++) {
        const doc = arrayDocs[i];

        try {
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
                throw new Error(`El documento ${doc.nombre} ya existe.`);
            }

            // Parámetros para guardar el documento
            let params = {
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

            return result;

        } catch (error) {
            throw error;
        }
    }
};

const updateDocs = async ({arrayDocs , coleccion, extrasKeyCode, extrasValueCode, extrasKeyDescription , extrasValueDescription}) => {
    if (!arrayDocs || arrayDocs.length == 0) {
        return;
    }

    for (let i = 0; i < arrayDocs.length; i++) {
        const doc = arrayDocs[i];
        try {
            if (!doc.id) {
                //es un nuevo archivo
                //buscamos archivo con mismo codigo y nombre
                await insertDocs({
                    arrayDocs: [doc],
                    coleccion: coleccion,
                    extrasKeyCode: extrasKeyCode,
                    extrasValueCode: extrasValueCode,
                    extrasKeyDescription: extrasKeyDescription,
                    extrasValueDescription: extrasValueDescription
                });
    
            }else{
                //no es nuevo archivo, se actualiza
                let params = {
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
    
                await invoker(
                    global.config.serv_mongoDocumentos,
                    "documentos/actualizarDocumento",
                    params
                );
            }
        } catch (error) {
            throw error;
        }
        
    }
}

const formatDateGp = (dateString) => {   
    const date = new Date(dateString);

    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = String(date.getUTCFullYear()); 
    
    return `${day}-${month}-${year}`;
}

module.exports = { getNextCodigo, insertDocs, updateDocs, formatDateGp };