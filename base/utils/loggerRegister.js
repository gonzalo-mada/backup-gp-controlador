"use strict";

module.exports = (res, next) => {
    next();

    let oldSend = res.send;

    res.send = function (data) {
        try {
            let datos = JSON.parse(data);

            if (datos.status == "ERROR" && datos.error.type == "FATAL") {
                logger.log(datos.error);
            }

            oldSend.apply(res, arguments);
        } catch (e) {
            oldSend.apply(res, arguments);
        }
    };
};
