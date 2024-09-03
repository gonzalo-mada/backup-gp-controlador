'use strict';

var express = require('express');

var services = require('../services/tiposprogramas.service');

var router = express.Router();

//rutas de facultades
//bruto
router.post('/bruto_getTiposProgramas', services.bruto_getTiposProgramas);
router.post('/bruto_insertTipoPrograma', services.bruto_insertTipoPrograma);
router.post('/bruto_updateTipoPrograma', services.bruto_updateTipoPrograma);
router.post('/bruto_deleteTipoPrograma', services.bruto_deleteTipoPrograma);

//logica getTiposProgramas
router.post('/getTiposProgramas', services.getTiposProgramas);
router.post('/insertTipoPrograma', services.insertTipoPrograma);
router.post('/updateTipoPrograma', services.updateTipoPrograma);
router.post('/deleteTipoPrograma', services.deleteTipoPrograma);

module.exports = router;