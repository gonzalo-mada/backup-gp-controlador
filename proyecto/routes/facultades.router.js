'use strict';

var express = require('express');

var services = require('../services/facultades.service');

var router = express.Router();

//rutas de facultades
//bruto
router.post('/bruto_getFacultades', services.bruto_getFacultades);
router.post('/bruto_insertFacultad', services.bruto_insertFacultad);
router.post('/bruto_updateFacultad', services.bruto_updateFacultad);
router.post('/bruto_deleteFacultad', services.bruto_deleteFacultad);

//mongo
router.post('/getDocumentosWithBinary', services.getDocumentosWithBinary);
router.post('/getArchiveDoc', services.getArchiveDoc);
router.post('/deleteDoc', services.deleteDoc);
module.exports = router;