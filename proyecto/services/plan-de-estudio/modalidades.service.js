var invoker = require('../../../base/invokers/invoker.invoker');
var reply = require('../../../base/utils/reply');
var validador = require('../../../base/utils/validador');
const reportInvoker = require("../../../base/invokers/report.invoker");

var modalidades = [
    {
        "Cod_modalidad": 1,
        "Descripcion_modalidad": "Híbrido"
    },
    {
        "Cod_modalidad": 2,
        "Descripcion_modalidad": "Presencial"
    },
    {
        "Cod_modalidad": 3,
        "Descripcion_modalidad": "Virtual"
    },
    {
        "Cod_modalidad": 4,
        "Descripcion_modalidad": "Semi-presencial"
    }
]

let getModalidad = async (req, res) => {

    try {
        res.json(reply.ok(modalidad));
    } catch (e) {
        res.json(reply.fatal(e));
    }
}

module.exports = {

    //data en bruto
    getModalidad
}