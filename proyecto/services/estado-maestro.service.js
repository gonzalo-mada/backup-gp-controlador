'use strict';
var invoker = require('../../base/invokers/invoker.invoker');
var reply = require('../../base/utils/reply');
var validador = require('../../base/utils/validador');
const reportInvoker = require("../../base/invokers/report.invoker");
const { getNextCodigo, insertDocs, updateDocs } = require('../utils/gpUtils')

let listEstadosMaestros = [];

const haveLogica = true;

const em = {
    "s" : "estado",
    "get": "getEstadosMaestros"
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
    "Cod_EstadoMaestro" : "codigo", //aqui nombre ariel
    "Descripcion_EstadoMaestro": "descripcion"
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
        listEstadosMaestros = listEstadosMaestros.map( e => {
            return {
                Cod_EstadoMaestro: e[campos_em.Cod_EstadoMaestro],
                Descripcion_EstadoMaestro: e[campos_em.Descripcion_EstadoMaestro]
            }
        });
        res.json(reply.ok(listEstadosMaestros));
    } catch (e) {
        res.json(reply.fatal(e));
    }
};


module.exports = {
    em,
    campos_em,
    listEstadosMaestros,
    getEstadosMaestros,
}