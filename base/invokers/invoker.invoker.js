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
                let finalData = "";

                res.on("data", function (data) {
                    finalData += data.toString();
                });

                res.on("end", function () {
                    try {
                        let result = JSON.parse(finalData);

                        if (result.status == "OK") {
                            onOk(
                                result.hasOwnProperty("data") ||
                                    result.data != undefined
                                    ? result.data
                                    : null
                            );
                        } else {
                            if (result.error.type == "FATAL") {
                                logger.log("params", params);
                                logger.log(
                                    `ERROR Fatal: ${dataServ.host}:${dataServ.port}${dataServ.path}/${serviceName}: ${result.error.message}`,
                                    result.error
                                );
                            }
                            onError(result.error);
                        }
                    } catch (error) {
                        logger.log("params", params);
                        logger.log(
                            `ERROR Parse: ${dataServ.host}:${dataServ.port}${dataServ.path}/${serviceName}: ${error.message}`,
                            error
                        );
                        logger.log(finalData);
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
