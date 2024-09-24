'use strict';

var express = require('express');

var services = require('../services/programas.service');

var router = express.Router();

router.post('/getDirector', services.getDirector);

module.exports = router;
