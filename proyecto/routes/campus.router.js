'use strict';

var express = require('express');

var services = require('../services/campus.service');

var router = express.Router();


router.post('/getCampus', services.getCampus);
router.post('/insertCampus', services.insertCampus);
router.post('/getArchivoDocumento', services.getArchivoDocumento);
router.post('/getDocumentosCampus', services.getDocumentosCampus);
router.post('/saveDocs', services.saveDocs);



module.exports = router;
