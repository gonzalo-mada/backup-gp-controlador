'use strict';

var express = require('express');

var services = require('../services/proyectoBase.service');

var router = express.Router();

/**
 * Ejemplo de desencriptado del token de sesión del usuario 'online'.
 */
router.post('/leeToken', services.leeToken);

/**
 * Ejemploa básicos de llamadas a servicios de lógica con y sin parámetros.
 */
router.post('/getFacultades', services.getFacultades);
router.post('/getInformacionPrograma', services.getInformacionPrograma);

/**
 * Ejemplos de servicio para generación de reportes Jasper.
 *  El primero genera el reporte en el controlador.
 *  El segundo descarga reporte enviado por un servicio en la logica.
 *  El tercero genera el reporte para el caso que la url no cuenta con el atributo ParentFolderUri
 */
router.post('/generaCertificadoAlumnoRegular', services.generaCertificadoAlumnoRegular);
router.post('/generaCertificadoAlumnoRegular2', services.generaCertificadoAlumnoRegular2);
router.post('/generaReporteCargaAcademica', services.generaReporteCargaAcademica);

/**
 * Ejemplo de uso de funciones script.
 */

router.post('/obtenerDigitoRut', services.obtenerDigitoRut);
router.post('/validarFormatoCorreo', services.validarFormatoCorreo);


module.exports = router;
