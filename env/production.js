'use strict';

module.exports = {
    app: {
        port: 3220,
        /** Si config.js --> tipoPregrado = true entonces codeAviso: portalAlumnos */
        codeAviso: 'portalFuncionarios',
        /** Si config.js --> tipoPregrado = true entonces ldap: pregrado */
        ldap: 'funcionario',
    },
    url: {
        host: 'logicabaja.uv.cl',
        port: 80,
        path: '/url',
        serviceName: 'getConfigUrl',
    },
    services: [
        /** No eliminar estos servicios */
        { name: 'menu' },
        { name: 'email' },
        { name: 'crypterJava' },
        { name: 'redis' },
        { name: 'login' },
        { name: 'ldap' },
        /** Solo si config.js --> tipoPregrado = false se pueden eliminar estas dos 'lógicas' */
        { name: 'carrerasPregrado' },
        { name: 'procesosAcademicos' },
        { name: "mongoDocumentos" },

        /** Agregar la lista de 'lógicas' que tu proyecto usará */
    ],
    params: [
        {
            /** No eliminar estos parámetros */
            app: 'base',
            params: [
                { code: 'crypter_algorithm' },
                { code: 'crypter_password_iv' },
                { code: 'jwt_password' },
            ],
        },
        /** Solo si config.js --> tipoPregrado = false se pueden eliminar estos parámetros */
        {
            app: 'portalAlumnos',
            params: [
                { code: 'idProyecto' },
                { code: 'modulo_inscripcion' },
                { code: 'modulo_modificacion' },
                { code: 'modulo_afg' },
            ],
        },
    ],
};
