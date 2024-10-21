'use strict';

var express = require('express');

var services = require('../../services/programas/estado-maestro.service');

var router = express.Router();

router.post('/getEstadosMaestros', services.getEstadosMaestros);


module.exports = router;