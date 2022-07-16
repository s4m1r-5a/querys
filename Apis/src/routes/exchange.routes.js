const { Router } = require("express");
const router = Router();

const exchangeCtrl = require("../controllers/exchange.controller");
const { authJwt } = require("../middlewares");

router.get("/balance", [authJwt.verifyToken], exchangeCtrl.getBalance);

module.exports = router;
