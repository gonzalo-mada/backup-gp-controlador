'use strict';

var express = require('express');

var services = require('../services/estados-acreditacion.service');

var router = express.Router();

//bruto
router.post('/getEstadosAcreditacion', services.getEstadosAcreditacion);
router.post('/insertEstadoAcreditacion', services.insertEstadoAcreditacion);
router.post('/updateEstadoAcreditacion', services.updateEstadoAcreditacion);
router.post('/deleteEstadoAcreditacion', services.deleteEstadoAcreditacion);



//mongo
router.post('/getDocumentosWithBinary', services.getDocumentosWithBinary);
router.post('/getArchiveDoc', services.getArchiveDoc);
// router.post('/deleteDoc', services.deleteDoc);
module.exports = router;