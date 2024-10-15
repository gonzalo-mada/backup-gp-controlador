"use strict";

/**
 * RUTAS PROYECTO
 */

module.exports = (app, rootPath) => {
    /** Router de ejemplo, SOLO para ambiente desarrollo */
    app.use(`/${rootPath}`, require("./proyecto/routes/proyectoBase.router"));
    app.use(`/${rootPath}/campus`, require("./proyecto/routes/programas/campus.router"));
    app.use(`/${rootPath}/facultades`, require("./proyecto/routes/programas/facultades.router"));
    app.use(`/${rootPath}/tiposprogramas`, require("./proyecto/routes/programas/tiposprogramas.router"));
    app.use(`/${rootPath}/categorias-tp`, require("./proyecto/routes/programas/categorias-tp.router"));
    app.use(`/${rootPath}/unidadesAcademicas`, require("./proyecto/routes/programas/unidadesAcademicas.router"));
    app.use(`/${rootPath}/reglamentos`, require("./proyecto/routes/programas/reglamentos.router"));
    app.use(`/${rootPath}/estados_acreditacion`, require("./proyecto/routes/programas/estados-acreditacion.router"));
    app.use(`/${rootPath}/programas`, require("./proyecto/routes/programas/programas.router"));
    app.use(`/${rootPath}/estado_maestro`, require("./proyecto/routes/programas/estado-maestro.router"));
    app.use(`/${rootPath}/suspensiones`, require("./proyecto/routes/programas/suspensiones.router"));
    app.use(`/${rootPath}/jornadas`, require("./proyecto/routes/plan-de-estudio/jornadas.router"));
    app.use(`/${rootPath}/modalidades`, require("./proyecto/routes/plan-de-estudio/modalidades.router"));

};
