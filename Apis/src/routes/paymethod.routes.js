const { Router } = require("express");
const router = Router();

//const methodCtrl = require("../controllers/paymethod.controller");
const { authJwt, verifySignup } = require("../middlewares");

/* router.get("/", [authJwt.verifyToken, authJwt.isAdmin], methodCtrl.getPayMethods);

router.get("/:methodId", [authJwt.verifyToken, authJwt.isAdmin], methodCtrl.getPayMethodById);

router.post("/", [authJwt.verifyToken, authJwt.isAdmin], methodCtrl.createPayMethod);

router.put("/:methodId", [authJwt.verifyToken, authJwt.isAdmin], methodCtrl.updatePayMethodById);

router.delete("/:methodId", [authJwt.verifyToken, authJwt.isAdmin], methodCtrl.deletePayMethodById); */

module.exports = router;
