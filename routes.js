"use strict";

/**
 * RUTAS PROYECTO
 */

module.exports = (app, rootPath) => {
    /** Router de ejemplo, SOLO para ambiente desarrollo */
    app.use(`/${rootPath}`, require("./proyecto/routes/proyectoBase.router"));
};