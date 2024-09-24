'use strict';

var express = require('express');

var services = require('../services/suspensiones.service');

var router = express.Router();

router.post('/getSuspensiones', services.getSuspensiones);
router.post('/insertSuspension', services.insertSuspension);
router.post('/updateSuspension', services.updateSuspension);
router.post('/deleteSuspension', services.deleteSuspension);

router.post('/getDocumentosWithBinary', services.getDocumentosWithBinary);
router.post('/getArchiveDoc', services.getArchiveDoc);

module.exports = router;