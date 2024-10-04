'use strict';

var express = require('express');

var services = require('../../services/plan-de-estudio/modalidad.service');

var router = express.Router();

//data en bruto jornadas
router.post('/getModalidad', services.getModalidad);


module.exports = router;
