'use strict';

var express = require('express');

var services = require('../../services/plan-de-estudio/jornadas.service');

var router = express.Router();

//data en bruto jornadas
router.post('/getJornadas', services.getJornadas);
router.post('/insertJornada', services.insertJornada);
router.post('/updateJornada', services.updateJornada);
router.post('/deleteJornada', services.deleteJornada);



module.exports = router;
