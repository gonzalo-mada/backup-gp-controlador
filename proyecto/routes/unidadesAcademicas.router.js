'use strict';

var express = require('express');

var services = require('../services/unidadesAcademicas.service');

var router = express.Router();

//datos en bruto unidades academicas
router.post('/bruto_getUnidadesAcad', services.bruto_getUnidadesAcad);
router.post('/bruto_insertUnidadesAcad', services.bruto_insertUnidadesAcad);
router.post('/bruto_updateUnidadesAcad', services.bruto_updateUnidadesAcad);
router.post('/bruto_deleteUnidadesAcad', services.bruto_deleteUnidadesAcad);

//mongo
router.post('/getDocumentosWithBinary', services.getDocumentosWithBinary);
router.post('/getArchiveDoc', services.getArchiveDoc);
router.post('/deleteDoc', services.deleteDoc);

//logica unidad académica
router.post('/logica_getUnidadesAcademicas', services.logica_getUnidadesAcademicas);
router.post('/logica_insertUnidadesAcademicas', services.logica_insertUnidadesAcademicas);
router.post('/logica_updateUnidadesAcademicas', services.logica_updateUnidadesAcademicas);
router.post('/logica_deleteUnidadesAcademicas', services.logica_deleteUnidadesAcademicas);

module.exports = router;
