'use strict';

var express = require('express');

var services = require('../services/campus.service');

var router = express.Router();


router.post('/getCampus', services.getCampus);



module.exports = router;
