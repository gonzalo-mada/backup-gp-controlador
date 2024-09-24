'use strict';
var invoker = require('../../base/invokers/invoker.invoker');
var reply = require('../../base/utils/reply');
var validador = require('../../base/utils/validador');

let getDirector = async (req , res) => {
    try {
        let args = JSON.parse(req.body.arg === undefined ? "{}" : req.body.arg);
        let msg = validador.validarParametro(args, "numero", "rut", true);

        if (msg != "") {
            res.json(reply.error(msg));
            return;
        }
        let params = {
            "rut": args.rut
        }

        let director = await invoker(
            global.config.serv_wsfincon,
            'rrhh/getDatosFuncionario',
            params
        );

        res.json(reply.ok(director));
    } catch (e) {
        console.log(e);
        
        // res.json(reply.fatal(e));  
    }
}

module.exports = {
    getDirector
}