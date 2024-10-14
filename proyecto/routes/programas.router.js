'use strict';

var express = require('express');

var services = require('../services/programas.service');

var router = express.Router();

router.post('/getDirector', services.getDirector);
router.post('/getPrograma', services.getPrograma);
router.post('/getProgramas', services.getProgramas);
router.post('/getInstituciones', services.getInstituciones);
router.post('/getInstitucionesSelected', services.getInstitucionesSelected);
router.post('/getGradConjunta', services.getGradConjunta);
router.post('/insertPrograma', services.insertPrograma);
router.post('/getDocumentosWithBinary', services.getDocumentosWithBinary);
router.post('/getLogPrograma', services.getLogPrograma);

module.exports = router;
