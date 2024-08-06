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
router.post('/getDocumentosWithBinaryCampus', services.getDocumentosWithBinaryCampus);
router.post('/saveDocs', services.saveDocs);
router.post('/updateDocs', services.updateDocs);
router.post('/deleteDocCampus', services.deleteDocCampus);




module.exports = router;
