'use strict';

var express = require('express');

var services = require('../../services/programas/unidadesAcademicas.service');

var router = express.Router();

//mongo
router.post('/getDocumentosWithBinary', services.getDocumentosWithBinary);
router.post('/getArchiveDoc', services.getArchiveDoc);

//logica unidad académica
router.post('/logica_getUnidadesAcademicas', services.logica_getUnidadesAcademicas);
router.post('/logica_insertUnidadesAcademicas', services.logica_insertUnidadesAcademicas);
router.post('/logica_updateUnidadesAcademicas', services.logica_updateUnidadesAcademicas);
router.post('/logica_deleteUnidadesAcademicas', services.logica_deleteUnidadesAcademicas);

module.exports = router;
