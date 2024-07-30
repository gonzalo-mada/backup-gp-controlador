"use strict";

var jwt = require("jsonwebtoken");

module.exports = (token) => {
    return new Promise((onOk, onError) => {
        jwt.verify(
            token,
            global.config.param_base_jwt_password,
            function (error, decoded) {
                if (error == null) {
                    onOk(decoded.data);
                } else {
                    onError(error);
                }
            }
        );
    });
};
