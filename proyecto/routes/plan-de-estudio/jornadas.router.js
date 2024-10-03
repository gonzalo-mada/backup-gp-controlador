'use strict';

var express = require('express');

var services = require('../../services/plan-de-estudio/jornadas.service');

var router = express.Router();

//data en bruto jornadas
router.post('/getJornadas', services.getJornadas);


module.exports = router;
