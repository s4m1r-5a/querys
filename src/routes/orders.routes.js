const { Router } = require("express");
const router = Router();
const orderCtrl = require("../controllers/orders.controller");
const { authJwt, verifySignup } = require("../middlewares");

router.get("/:symbol?", [authJwt.verifyToken], orderCtrl.getOrders);

router.post("/", [authJwt.verifyToken], orderCtrl.placeOrder);

router.post("/sync/:id", [authJwt.verifyToken], orderCtrl.syncOrder);

router.delete("/:symbol/:orderId", orderCtrl.cancelOrder);

module.exports = router;
