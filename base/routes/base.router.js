"use strict";

var express = require("express");

var baseService = require("../services/base.service");
var menuService = require("../services/menu.service");
var mailService = require("../services/mail.service");
var userService = require("../services/user.service");
var navService = require("../services/navigate.service");

var router = express.Router();

router.post("/reload", baseService.reload);
router.post("/getFechaActual", baseService.getFechaActual);
router.post("/saveIdioma", baseService.saveIdioma);

router.post("/getAplicaciones", menuService.getAplicaciones);
router.post("/getMenus", menuService.getMenus);
router.post("/getModulos", menuService.getModulos);
router.post("/getAvisos", menuService.getAvisos);
router.post("/getNoticias", menuService.getNoticias);

router.post("/getUser", userService.getUser);
router.post("/saveKeyUser", userService.saveKeyUser);
router.post("/getKeyUser", userService.getKeyUser);

router.post("/sendMail", mailService.sendMail);

router.post("/navigate", navService.navigate);
router.post("/navigateApp", navService.navigateApp);
router.post("/getAppUrl", navService.getAppUrl);

module.exports = router;
