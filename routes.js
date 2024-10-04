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
    app.use(`/${rootPath}/reglamentos`, require("./proyecto/routes/reglamentos.router"));
    app.use(`/${rootPath}/estados_acreditacion`, require("./proyecto/routes/estados-acreditacion.router"));
    app.use(`/${rootPath}/programas`, require("./proyecto/routes/programas.router"));
    app.use(`/${rootPath}/estado_maestro`, require("./proyecto/routes/estado-maestro.router"));
    app.use(`/${rootPath}/suspensiones`, require("./proyecto/routes/suspensiones.router"));
    app.use(`/${rootPath}/jornadas`, require("./proyecto/routes/plan-de-estudio/jornadas.router"));
    app.use(`/${rootPath}/modalidades`, require("./proyecto/routes/plan-de-estudio/modalidades.router"));

};
