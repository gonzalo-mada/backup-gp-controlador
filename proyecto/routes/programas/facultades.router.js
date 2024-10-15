'use strict';

var express = require('express');

var services = require('../../services/programas/facultades.service');

var router = express.Router();

//rutas de facultades
router.post('/getFacultades', services.getFacultades);
router.post('/insertFacultad', services.insertFacultad);
router.post('/updateFacultad', services.updateFacultad);
router.post('/deleteFacultad', services.deleteFacultad);

//mongo
router.post('/getDocumentosWithBinary', services.getDocumentosWithBinary);
router.post('/getArchiveDoc', services.getArchiveDoc);
module.exports = router;