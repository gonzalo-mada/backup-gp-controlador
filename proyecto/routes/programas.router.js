'use strict';

var express = require('express');

var services = require('../services/programas.service');

var router = express.Router();

router.post('/getDirector', services.getDirector);
router.post('/getProgramas', services.getProgramas);
router.post('/getInstituciones', services.getInstituciones);

module.exports = router;
