'use strict';

var express = require('express');

var services = require('../services/campus.service');

var router = express.Router();

//sql server
router.post('/getCampus', services.getCampus);
router.post('/insertCampus', services.insertCampus);
router.post('/updateCampus', services.updateCampus);
router.post('/deleteCampus', services.deleteCampus);

//mongo
router.post('/getArchivoDocumento', services.getArchivoDocumento);
router.post('/getDocumentosCampus', services.getDocumentosCampus);
router.post('/getDocumentosWithBinary', services.getDocumentosWithBinary);
router.post('/saveDocs', services.saveDocs);
router.post('/updateDocs', services.updateDocs);
router.post('/deleteDoc', services.deleteDoc);

//logica campus
router.post('/logica_getCampus', services.logica_getCampus);
router.post('/logica_insertCampus', services.logica_insertCampus);
router.post('/logica_updateCampus', services.logica_updateCampus);
router.post('/logica_deleteCampus', services.logica_deleteCampus);



module.exports = router;
