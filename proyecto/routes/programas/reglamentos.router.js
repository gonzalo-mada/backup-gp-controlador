'use strict';

var express = require('express');

var services = require('../../services/programas/reglamentos.service');

var router = express.Router();

//data en bruto
router.post('/getReglamentos', services.getReglamentos);
router.post('/insertReglamento', services.insertReglamento);
router.post('/updateReglamento', services.updateReglamento);
router.post('/deleteReglamentos', services.deleteReglamentos);

//mongo
router.post('/getDocumentosWithBinary', services.getDocumentosWithBinary);
router.post('/getArchiveDoc', services.getArchiveDoc);

module.exports = router;
