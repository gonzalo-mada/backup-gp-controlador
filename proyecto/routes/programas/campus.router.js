'use strict';

var express = require('express');

var services = require('../../services/programas/campus.service');

var router = express.Router();

//logica campus
router.post('/logica_getCampus', services.logica_getCampus);
router.post('/logica_insertCampus', services.logica_insertCampus);
router.post('/logica_updateCampus', services.logica_updateCampus);
router.post('/logica_deleteCampus', services.logica_deleteCampus);

//mongo
router.post('/getArchivoDocumento', services.getArchivoDocumento);
router.post('/getDocumentosWithBinary', services.getDocumentosWithBinary);

module.exports = router;
