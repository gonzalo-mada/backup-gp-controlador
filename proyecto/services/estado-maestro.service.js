'use strict';
var invoker = require('../../base/invokers/invoker.invoker');
var reply = require('../../base/utils/reply');
var validador = require('../../base/utils/validador');
const reportInvoker = require("../../base/invokers/report.invoker");
const { getNextCodigo, insertDocs, updateDocs } = require('../utils/gpUtils')

let listEstadosMaestros = [];

const haveLogica = false;

const em = {
    "s" : "aca nombre servicio",
    "get": "nombre s get"
};


listEstadosMaestros = [
    {
        "Cod_EstadoMaestro" : 1,
        "Descripcion_EstadoMaestro": "Activo"
    },
    {
        "Cod_EstadoMaestro" : 2,
        "Descripcion_EstadoMaestro": "Inactivo"
    },
    {
        "Cod_EstadoMaestro" : 3,
        "Descripcion_EstadoMaestro": "Suspensión"
    }
];



const campos_em = {
    "Cod_EstadoMaestro" : "Cod_EstadoMaestro", //aqui nombre ariel
    "Descripcion_EstadoMaestro": "Descripcion_EstadoMaestro"
};



let getEstadosMaestros = async (req, res) => {
    try {
        if (haveLogica) {
            listEstadosMaestros = await invoker(
                global.config.serv_basePostgrado,
                `${em.s}/${em.get}`,
                null
            );
        }
        res.json(reply.ok(listEstadosMaestros));
    } catch (e) {
        res.json(reply.fatal(e));
    }
};


module.exports = {
    campos_em,
    listEstadosMaestros,
    getEstadosMaestros,
}