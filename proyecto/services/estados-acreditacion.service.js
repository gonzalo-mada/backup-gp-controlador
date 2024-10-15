'use strict';
var invoker = require('../../base/invokers/invoker.invoker');
var reply = require('../../base/utils/reply');
var validador = require('../../base/utils/validador');
const uuid = require("uuid");
const reportInvoker = require("../../base/invokers/report.invoker");
const { formatDateToSQL, minDate, notAgencia, normalizeSwitch, } = require('../utils/estadosAcredUtils')
const { getNextCodigo, insertDocs, updateDocs, formatDateGp } = require('../utils/gpUtils')

let listEstadosAcred = [];
let listTiemposAcred = [];

const haveLogica = true;
const ea = {
    "s" : "estado",
    "get" : "getEstadosAcreditacion",
    "insert" : "insertEstadoAcreditacion",
    "update" : "updateEstadoAcreditacion",
    "delete" : "deleteEstadoAcreditacion",
}
const ta = {
    "s" : "tiempoAcreditacion",
    "get" : "getTiempoAcreditacion",
    "insert" : "insertTiempoAcreditacion",
    "update" : "updateTiempoAcreditacion",
    "delete" : "deleteTiempoAcreditacion",
}

listEstadosAcred = [
    {
        "Cod_acreditacion" : 1,
        "Acreditado" : "SI",
        "Certificado" : "NO",
        "Nombre_ag_acredit" : "AGENCIAPRO",
        "Nombre_ag_certif" : "N/A",
        "Evaluacion_interna" : "SI",
        "Fecha_informe" : "2024-09-06",
        "Cod_tiempoacredit" : 1
    }
]

listTiemposAcred = [
    {
        "Cod_tiempoacredit" : 1,
        "Fecha_inicio" : '2024-09-06',
        "Fecha_termino" : '2026-09-06',
        "Cantidad_anios" : 2
    }
]

const campos_ea = {
    "Cod_acreditacion" : "codigoEstadoAcred", //aqui nombre que puso ariel
    "Acreditado" : "acreditado",
    "Certificado" : "certificado",
    "Evaluacion_interna" : "evaInterna",
    "Nombre_ag_acredit" : "nombreAgAcred",
    "Nombre_ag_certif" : "nombreAgCert",
    "Fecha_informe" : "fechaInforme",
    "Cod_tiempoacredit" : "codigoTiempoAcred",
    "sigla": "sigla"
}

const campos_ta = {
    "Cod_tiempoacredit" : "codigoTiempoAcred",
    "Fecha_inicio" : "fechaInicio",
    "Fecha_termino" : "fechaTermino",
    "Cantidad_anios" : "cantidad"
}


let getEstadosAcreditacion = async (req, res) => {
    try {

        if (haveLogica) {
            listEstadosAcred = await invoker(
                global.config.serv_basePostgrado,
                `${ea.s}/${ea.get}`,
                null
            );
            listTiemposAcred = await invoker(
                global.config.serv_basePostgrado,
                `${ta.s}/${ta.get}`,
                null
            );
        }
        
        let listMerge = listEstadosAcred.map( ea => {
            let tiempos = listTiemposAcred.find( tiempos => tiempos.codigo === ea.codigoAcred)
            return {
                "Sigla": ea.sigla,
                "Cod_acreditacion" : ea.codigoAcred,
                "Acreditado" : ea[campos_ea.Acreditado],
                "Certificado" : ea[campos_ea.Certificado],
                "Nombre_ag_acredit" : ea[campos_ea.Nombre_ag_acredit],
                "Nombre_ag_certif" : ea[campos_ea.Nombre_ag_certif],
                "Evaluacion_interna" : ea.evaluacionInt,
                "Fecha_informe" : formatDateGp(ea[campos_ea.Fecha_informe]),
                "tiempo" : tiempos ? {
                    "Cod_tiempoacredit" : tiempos.codigo,
                    "Fecha_inicio" : formatDateGp(tiempos[campos_ta.Fecha_inicio]),
                    "Fecha_termino" : formatDateGp(tiempos[campos_ta.Fecha_termino]),
                    "Cantidad_anios" : tiempos.cantAnios
                } : null
            }
        })
        res.json(reply.ok(listMerge));
    } catch (e) {
        res.json(reply.fatal(e));
    }
}

let insertEstadoAcreditacion = async (req, res) => {
    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        console.log("args insert",args);
        
        let msg = validador.validarParametro(args, "date", "Fecha_informe", true);
        msg += validador.validarParametro(args, "cadena", "Acreditado", false);
        msg += validador.validarParametro(args, "cadena", "Certificado", false);
        msg += validador.validarParametro(args, "cadena", "Nombre_ag_acredit", false);
        msg += validador.validarParametro(args, "cadena", "Nombre_ag_certif", false);
        msg += validador.validarParametro(args, "cadena", "Evaluacion_interna", false);
        msg += validador.validarParametro(args, "date", "Fecha_inicio", false);
        msg += validador.validarParametro(args, "date", "Fecha_termino", false);
        msg += validador.validarParametro(args, "numero", "Cantidad_anios", false);
        // msg += validador.validarParametro(args, "lista", "files", false);

        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }

        if (haveLogica) {
            listEstadosAcred = await invoker(
                global.config.serv_basePostgrado,
                `${ea.s}/${ea.get}`,
                null
            );
            listTiemposAcred = await invoker(
                global.config.serv_basePostgrado,
                `${ta.s}/${ta.get}`,
                null
            );
        }

        //condiciones para switch
        let switchAcreditado = normalizeSwitch(args.Acreditado, 'acreditado')
        let switchCertificado = normalizeSwitch(args.Certificado, 'certificado')
        let switchEvaluacionInterna = normalizeSwitch(args.Evaluacion_interna, 'evaluacion')
                
        let codigo_ea = getNextCodigo(listEstadosAcred,'codigoAcred');
        let codigo_ta = getNextCodigo(listTiemposAcred,'codigo');

        let params_ta = {
            [campos_ta.Cod_tiempoacredit]: parseInt(codigo_ta),
            [campos_ta.Fecha_inicio]: minDate,
            [campos_ta.Fecha_termino]: minDate,
            [campos_ta.Cantidad_anios]: null
        };

        let params_ea = {
            [campos_ea.Cod_acreditacion]: parseInt(codigo_ea),
            [campos_ea.Acreditado]: switchAcreditado,
            [campos_ea.Certificado]: switchCertificado,
            [campos_ea.Evaluacion_interna]: switchEvaluacionInterna,
            [campos_ea.Fecha_informe]: formatDateToSQL(args.Fecha_informe),
            [campos_ea.Cod_tiempoacredit]: parseInt(codigo_ta),
        };

        // Actualiza params_ta y params_ea basado en los valores de los switches
        switch (switchAcreditado) {
            case 'SI':
                params_ta = {
                ...params_ta,
                [campos_ta.Fecha_inicio]: formatDateToSQL(args.tiempo.Fecha_inicio),
                [campos_ta.Fecha_termino]: formatDateToSQL(args.tiempo.Fecha_termino),
                [campos_ta.Cantidad_anios]: args.tiempo.Cantidad_anios
                };
                params_ea[campos_ea.Nombre_ag_acredit] = args.Nombre_ag_acredit;
                params_ea[campos_ea.sigla] = `ACREDx${args.tiempo.Cantidad_anios}AÑOS(HASTA:${args.tiempo.Fecha_termino})`;
                break;
            default: // 'NO'
                params_ea[campos_ea.Nombre_ag_acredit] = notAgencia;
                params_ea[campos_ea.sigla] = switchCertificado === 'SI' ? `CERTIFx${args.Nombre_ag_certif})` : `N/A`;
                break;
        }
          
        switch (switchCertificado) {
            case 'SI':
                params_ea[campos_ea.Nombre_ag_certif] = args.Nombre_ag_certif;
                params_ea[campos_ea.sigla] = `CERTIFx${args.Nombre_ag_certif})`;
                break;
            default: // 'NO'
                params_ea[campos_ea.Nombre_ag_certif] = notAgencia;
                params_ea[campos_ea.sigla] = switchAcreditado === 'SI' ? `ACREDx${args.tiempo.Cantidad_anios}AÑOS(HASTA:${args.tiempo.Fecha_termino})` : `N/A`;
                break;
        }


        //inserts
        let insertTiemposAcred;
        let insertEstadosAcred;
        if (haveLogica) {
            insertTiemposAcred = await invoker (
                global.config.serv_basePostgrado,
                `${ta.s}/${ta.insert}`,
                params_ta
            );

            insertEstadosAcred = await invoker (
                global.config.serv_basePostgrado,
                `${ea.s}/${ea.insert}`,
                params_ea
            ); 
        }else{            
            insertTiemposAcred = listTiemposAcred.push(params_ta)
            insertEstadosAcred = listEstadosAcred.push(params_ea)
        }

        if (!insertEstadosAcred) {
            res.json(reply.error(`El estado de acreditación no pudo ser creado.`));
            return;
        }else{
            try {
                let resultInsertDoc = await insertDocs({
                    arrayDocs: args.docsToUpload,
                    coleccion: 'estados_acreditacion',
                    extrasKeyCode: campos_ea.Cod_acreditacion,
                    extrasValueCode: codigo_ea,
                    extrasKeyDescription: 'nombreAgencia',
                    extrasValueDescription: switchAcreditado === 'SI' ? args.Nombre_ag_acredit : args.Nombre_ag_certif
                });
                console.log("resultInsertDoc",resultInsertDoc);
                
            } catch (error) {
                //error al insertar documento entonces se elimina el registro recién creado
                if (haveLogica) {
                    await invoker(
                        global.config.serv_basePostgrado,
                        `${ea.s}/${ea.delete}`,
                        { [campos_ea.Cod_acreditacion] : parseInt(codigo_ea) }
                    );
                    await invoker(
                        global.config.serv_basePostgrado,
                        `${ta.s}/${ta.delete}`,
                        { [campos_ta.Cod_tiempoacredit] : parseInt(codigo_ta) }
                    );
                    // res.json(reply.error(error));
                }else{
                    listEstadosAcred = listEstadosAcred.filter( eA => eA[campos_ea.Cod_acreditacion] != parseInt(codigo_ea))
                    listTiemposAcred = listTiemposAcred.filter( tA => tA[campos_ta.Cod_tiempoacredit] != parseInt(codigo_ta))
                    // res.json(reply.error(error));
                }
                throw error;
            }
        }

        let response = { dataWasInserted: insertEstadosAcred , dataInserted: null}
        res.json(reply.ok(response));

    } catch (e) {        
        res.json(reply.fatal(e));
    }
}

let updateEstadoAcreditacion = async (req, res) => {
    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        // console.log("args from update",args);
        
        let msg = validador.validarParametro(args, "date", "Fecha_informe", true);
        msg += validador.validarParametro(args, "numero", "Cod_acreditacion", true);
        msg += validador.validarParametro(args, "numero", "Cod_tiempoacredit", true);
        msg += validador.validarParametro(args, "cadena", "Acreditado", false);
        msg += validador.validarParametro(args, "cadena", "Certificado", false);
        msg += validador.validarParametro(args, "cadena", "Nombre_ag_acredit", false);
        msg += validador.validarParametro(args, "cadena", "Nombre_ag_certif", false);
        msg += validador.validarParametro(args, "cadena", "Evaluacion_interna", false);
        msg += validador.validarParametro(args, "date", "Fecha_inicio", false);
        msg += validador.validarParametro(args, "date", "Fecha_termino", false);
        msg += validador.validarParametro(args, "numero", "Cantidad_anios", false);

        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }

        //docs por eliminar
        if (args.docsToDelete !== undefined) {
            if (args.docsToDelete.length != 0) {
                for (let i = 0; i < args.docsToDelete.length; i++) {
                    const doc = args.docsToDelete[i];
    
                    let deleteDoc = await invoker(
                        global.config.serv_mongoDocumentos,
                        "documentos/eliminarDocumento",
                        {
                            database: "gestionProgramas",
                            coleccion: "estados_acreditacion",
                            id: doc.id
            
                        }
                    );
    
                    if (!deleteDoc.deleted) {
                        res.json(reply.error(`El documento no pudo ser eliminado.`));
                        return;
                    }
                }
            }
        }
    
        

        let switchAcreditado = normalizeSwitch(args.Acreditado, 'acreditado')
        let switchCertificado = normalizeSwitch(args.Certificado, 'certificado')
        let switchEvaluacion_interna = normalizeSwitch(args.Evaluacion_interna, 'evaluacion')

        await updateDocs({
            arrayDocs: args.docsToUpload,
            coleccion: 'estados_acreditacion',
            extrasKeyCode: campos_ea.Cod_acreditacion,
            extrasValueCode: args.Cod_acreditacion,
            extrasKeyDescription: 'nombreAgencia',
            extrasValueDescription: switchAcreditado === 'SI' ? args.Nombre_ag_acredit : args.Nombre_ag_certif
        });

        let params_ta = {
            [campos_ta.Cod_tiempoacredit]: args.Cod_tiempoacredit,
            [campos_ta.Fecha_inicio]: !args.tiempo.Fecha_inicio ? minDate : formatDateToSQL(args.tiempo.Fecha_inicio),
            [campos_ta.Fecha_termino]: !args.tiempo.Fecha_termino ? minDate : formatDateToSQL(args.tiempo.Fecha_termino),
            [campos_ta.Cantidad_anios]: args.tiempo.Cantidad_anios
        };

        let params_ea = {
            [campos_ea.Cod_acreditacion]: args.Cod_acreditacion,
            [campos_ea.Acreditado]: switchAcreditado,
            [campos_ea.Certificado]: switchCertificado,
            [campos_ea.Evaluacion_interna]: switchEvaluacion_interna,
            [campos_ea.Fecha_informe]: formatDateToSQL(args.Fecha_informe),
            [campos_ea.Cod_tiempoacredit]: args.Cod_tiempoacredit,
        };

        // Actualiza params_ta y params_ea basado en los valores de los switches

        switch (switchAcreditado) {
            case 'SI':
                params_ea[campos_ea.Nombre_ag_acredit] = args.Nombre_ag_acredit;
                params_ea[campos_ea.sigla] = `ACREDx${args.tiempo.Cantidad_anios}AÑOS(HASTA:${args.tiempo.Fecha_termino})`;
                break;
            default: // 'NO'
                params_ea[campos_ea.Nombre_ag_acredit] = notAgencia;
                params_ea[campos_ea.sigla] = switchCertificado === 'SI' ? `CERTIFx${args.Nombre_ag_certif})` : `N/A`;
                break;
        }
          
        switch (normalizeSwitch(args.Certificado, 'certificado')) {
            case 'SI':
                params_ta = {
                    ...params_ta,
                    [campos_ta.Fecha_inicio]: formatDateToSQL(args.tiempo.Fecha_inicio),
                    [campos_ta.Fecha_termino]: formatDateToSQL(args.tiempo.Fecha_termino),
                    [campos_ta.Cantidad_anios]: args.tiempo.Cantidad_anios
                };
                params_ea[campos_ea.Nombre_ag_certif] = args.Nombre_ag_certif;
                params_ea[campos_ea.sigla] = `CERTIFx${args.Nombre_ag_certif})`;
                break;
            default: // 'NO'
                params_ea[campos_ea.Nombre_ag_certif] = notAgencia;
                params_ea[campos_ea.sigla] = switchAcreditado === 'SI' ? `ACREDx${args.tiempo.Cantidad_anios}AÑOS(HASTA:${args.tiempo.Fecha_termino})` : `N/A`;
                break;
        }

        let updateTiemposAcred;
        let updateEstadosAcred;

        if (haveLogica) {
            updateTiemposAcred = await invoker (
                global.config.serv_basePostgrado,
                `${ta.s}/${ta.update}`,
                params_ta
            );

            updateEstadosAcred = await invoker (
                global.config.serv_basePostgrado,
                `${ea.s}/${ea.update}`,
                params_ea
            ); 
        }else{                        
            let index_ta = listTiemposAcred.findIndex( item => item.Cod_tiempoacredit === params_ta[campos_ta.Cod_tiempoacredit])
            if (index_ta !== -1) {
                updateTiemposAcred = listTiemposAcred[index_ta] = { ...listTiemposAcred[index_ta], ...params_ta }
            }else{
                updateTiemposAcred = null
            }
            let index_ea = listEstadosAcred.findIndex( item => item.Cod_acreditacion === params_ea[campos_ea.Cod_acreditacion])
            if (index_ea !== -1) {
                updateEstadosAcred = listEstadosAcred[index_ea] = { ...listEstadosAcred[index_ea], ...params_ea }
            }else{
                updateEstadosAcred = null
            }
        }

        let response = { dataWasUpdated: updateEstadosAcred, dataUpdated: null }
        res.json(reply.ok(response));

    } catch (e) {
        res.json(reply.fatal(e));
    }
}

let deleteEstadoAcreditacion = async (req, res) => {
    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "lista", "estadosAcreditacionToDelete", true);

        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }

        let estadosAcreditacionToDelete = args.estadosAcreditacionToDelete;

        for (let i = 0; i < estadosAcreditacionToDelete.length; i++) {
            const e = estadosAcreditacionToDelete[i];
            console.log("e",e);
            

            let params_ea = {
                "codigoEstadoAcred": parseInt(e.Cod_acreditacion)
            }

            let params_ta = {
                [campos_ta.Cod_tiempoacredit]: parseInt(e.tiempo.Cod_tiempoacredit),
            }
            
            let deleteEstadosAcred;
            let deleteTiemposAcred;

            if (haveLogica) {
                deleteEstadosAcred = await invoker (
                    global.config.serv_basePostgrado,
                    `${ea.s}/${ea.delete}`,
                    params_ea
                );
                deleteTiemposAcred = await invoker (
                    global.config.serv_basePostgrado,
                    `${ta.s}/${ta.delete}`,
                    params_ta
                );
            }else{
                deleteEstadosAcred = listEstadosAcred = listEstadosAcred.filter( eA => eA[campos_ea.Cod_acreditacion] != parseInt(e.Cod_acreditacion))
                deleteTiemposAcred = listTiemposAcred = listTiemposAcred.filter( tA => tA[campos_ta.Cod_tiempoacredit] != parseInt(e.Cod_tiempoacredit))
            }

            if (!deleteEstadosAcred){
                res.json(reply.error(`El estado de acreditación no pudo ser eliminado.`));
                return;
            }

            let documentos = await invoker(
                global.config.serv_mongoDocumentos,
                "documentos/buscarDocumentos",
                {
                    database: "gestionProgramas",
                    coleccion: "estados_acreditacion",
                    documento: {
                        [`extras.${campos_ea.Cod_acreditacion}`]: e.Cod_acreditacion
                    },
                }
            );

            for(let d of documentos){
                await invoker(
                    global.config.serv_mongoDocumentos,
                    "documentos/eliminarDocumento",
                    {
                        database: 'gestionProgramas',
                        coleccion: 'estados_acreditacion',
                        id: d.id,
                    }
                );
            }

        }

        let response = { dataWasDeleted: true , dataDeleted: estadosAcreditacionToDelete}
        res.json(reply.ok(response));
    } catch (e) {
        res.json(reply.fatal(e));
    }
}

let getDocumentosWithBinary = async (req, res) => {

    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "numero","Cod_acreditacion", true);
 
        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }
 
        let documentos = await invoker(
            global.config.serv_mongoDocumentos,
            "documentos/buscarDocumentos",
            {
                database: "gestionProgramas",
                coleccion: "estados_acreditacion",
                documento: {
                    [`extras.${campos_ea.Cod_acreditacion}`]: args.Cod_acreditacion
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
                    coleccion: "estados_acreditacion",
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
                coleccion: "estados_acreditacion",
                id: args.id,
            }
        );

        res.send(archivo);
    } catch (e) {
        res.json(reply.fatal(e));
    }
};
module.exports = {
    getEstadosAcreditacion,
    insertEstadoAcreditacion,
    updateEstadoAcreditacion,
    deleteEstadoAcreditacion,
    getDocumentosWithBinary,
    getArchiveDoc

}