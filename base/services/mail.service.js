"use strict";

var invoker = require("../invokers/invoker.invoker");

var reply = require("../utils/reply");
var validador = require("../utils/validador");

let sendMail = async (request, response) => {
    try {
        let args = JSON.parse(
            request.body.arg === undefined ? "{}" : request.body.arg
        );
        let msg = validador.validarParametro(args, "cadena", "subject", true);
        msg += validador.validarParametro(args, "cadena", "body", true);
        msg += validador.validarParametro(args, "cadena", "user", true);
        msg += validador.validarParametro(args, "cadena", "rut", true);
        msg += validador.validarParametro(args, "cadena", "correoUV", true);

        if (msg == "") {
            let data = await invoker(
                global.config.serv_email,
                "sendMail",
                JSON.parse(request.body.arg)
            );

            if (data == "send") {
                response.json(reply.ok(data));
            } else {
                response.json(
                    reply.error(
                        "El correo no pudo ser enviado. Intente nuevamente."
                    )
                );
            }
        } else {
            response.json(reply.error(msg));
        }
    } catch (e) {
        response.json(reply.fatal(e));
    }
};

module.exports = {
    sendMail,
};
