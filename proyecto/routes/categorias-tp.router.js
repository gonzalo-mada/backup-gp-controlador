'use strict';

var express = require('express');

var services = require('../services/categorias-tp.service');

var router = express.Router();

//rutas de facultades
//bruto
router.post('/bruto_getCategoriasTp', services.bruto_getCategoriasTp);
router.post('/bruto_insertCategoriaTp', services.bruto_insertCategoriaTp);
router.post('/bruto_updateCategoriaTp', services.bruto_updateCategoriaTp);
router.post('/bruto_deleteCategoriaTp', services.bruto_deleteCategoriaTp);

//logica
router.post('/getCategoriasTp', services.getCategoriasTp);
router.post('/insertCategoriaTp', services.insertCategoriaTp);
router.post('/updateCategoriaTp', services.updateCategoriaTp);
router.post('/deleteCategoriaTp', services.deleteCategoriaTp);

module.exports = router;