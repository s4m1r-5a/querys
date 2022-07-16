const { Router } = require("express");
const router = Router();

const monitorsCtrl = require("../controllers/monitors.controller");
const { authJwt } = require("../middlewares");

router.get("/", [authJwt.verifyToken], monitorsCtrl.getMonitors);

router.get("/:id", [authJwt.verifyToken], monitorsCtrl.getMonitor);

router.post("/:id/start", [authJwt.verifyToken], monitorsCtrl.startMonitor);

router.post("/:id/stop", [authJwt.verifyToken], monitorsCtrl.stopMonitor);

router.post("/", [authJwt.verifyToken], monitorsCtrl.insertMonitor);

router.patch("/:id", [authJwt.verifyToken], monitorsCtrl.updateMonitor);

router.delete("/:id", [authJwt.verifyToken], monitorsCtrl.deleteMonitor);

module.exports = router;
