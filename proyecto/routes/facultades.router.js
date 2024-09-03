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

//logica
router.post('/getFacultades', services.getFacultades);
router.post('/insertFacultad', services.insertFacultad);
router.post('/updateFacultad', services.updateFacultad);
router.post('/deleteFacultad', services.deleteFacultad);


//mongo
router.post('/getDocumentosWithBinary', services.getDocumentosWithBinary);
router.post('/getArchiveDoc', services.getArchiveDoc);
router.post('/deleteDoc', services.deleteDoc);
module.exports = router;