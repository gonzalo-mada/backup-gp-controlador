var invoker = require('../../../base/invokers/invoker.invoker');
var reply = require('../../../base/utils/reply');
var validador = require('../../../base/utils/validador');
const reportInvoker = require("../../../base/invokers/report.invoker");


var jornadas = [
    {
        "Cod_jornada": 1,
        "Descripcion_jornada": "Diurna"
    },
    {
        "Cod_jornada": 2,
        "Descripcion_jornada": "Nocturna"
    },
    {
        "Cod_jornada": 3,
        "Descripcion_jornada": "Diurno-Vespertino"
    }
]

let getJornadas = async (req, res) => {

    try {
        res.json(reply.ok(jornadas));
    } catch (e) {
        res.json(reply.fatal(e));
    }
}




module.exports = {

    //data en bruto
    getJornadas
}