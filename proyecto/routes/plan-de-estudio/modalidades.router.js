'use strict';

var express = require('express');

var services = require('../../services/plan-de-estudio/modalidades.service');

var router = express.Router();

//data en bruto jornadas
router.post('/getModalidades', services.getModalidades);
router.post('/insertModalidad', services.insertModalidad);
router.post('/updateModalidad', services.updateModalidad);
router.post('/deleteModalidad', services.deleteModalidad);

module.exports = router;
