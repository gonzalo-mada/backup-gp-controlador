"use strict";

/**
 * RUTAS PROYECTO
 */

module.exports = (app, rootPath) => {
    /** Router de ejemplo, SOLO para ambiente desarrollo */
    app.use(`/${rootPath}`, require("./proyecto/routes/proyectoBase.router"));
    app.use(`/${rootPath}/campus`, require("./proyecto/routes/campus.router"));
    app.use(`/${rootPath}/facultades`, require("./proyecto/routes/facultades.router"));
    app.use(`/${rootPath}/tiposprogramas`, require("./proyecto/routes/tiposprogramas.router"));
    app.use(`/${rootPath}/categorias-tp`, require("./proyecto/routes/categorias-tp.router"));
    app.use(`/${rootPath}/unidadesAcademicas`, require("./proyecto/routes/unidadesAcademicas.router"));

};
