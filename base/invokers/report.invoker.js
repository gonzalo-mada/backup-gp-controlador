"use strict";

var http = require("http");

module.exports = (dataServ, serviceName, params) => {
    let p = new Promise((onOk, onError) => {
        try {
            let headers = {
                "Content-Type":
                    "application/x-www-form-urlencoded;charset=utf-8",
            };

            let op = {
                host: dataServ.host,
                port: dataServ.port,
                path: `${dataServ.path}/${serviceName}`,
                method: "POST",
                headers: headers,
            };

            let req = http.request(op, function (res) {
                let chunks = [];

                res.on("data", function (chunk) {
                    chunks.push(chunk);
                });

                res.on("end", function () {
                    try {
                        let body = Buffer.concat(chunks);

                        onOk(body);
                    } catch (error) {
                        logger.log("params", params);
                        logger.log(
                            `ERROR Parse: ${dataServ.host}:${dataServ.port}${dataServ.path}/${serviceName}: ${error.message}`,
                            error
                        );
                        logger.log(chunks.toString());
                        onError(
                            `${dataServ.host}:${dataServ.port}${dataServ.path}/${serviceName}: ${error.message}`
                        );
                    }
                });
            });

            req.write(
                "arg=" +
                    (params == null
                        ? encodeURIComponent(JSON.stringify({}))
                        : encodeURIComponent(JSON.stringify(params)))
            );

            req.on("error", function (error) {
                logger.log(
                    `ERROR Request: ${dataServ.host}:${dataServ.port}${dataServ.path}/${serviceName}: ${error.message}`,
                    error
                );
                onError(
                    `${dataServ.host}:${dataServ.port}${dataServ.path}/${serviceName}: ${error.message}`
                );
            });

            req.end();
        } catch (error) {
            logger.log(
                `ERROR No controlado: ${dataServ.host}:${dataServ.port}${dataServ.path}/${serviceName}: ${error.message}`,
                error
            );
            onError(
                `${dataServ.host}:${dataServ.port}${dataServ.path}/${serviceName}: ${error.message}`
            );
        }
    });

    return p;
};
