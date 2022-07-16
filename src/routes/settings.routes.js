const { Router } = require("express");
const router = Router();

const settingsCtrl = require("../controllers/settings.controller");
const { authJwt, verifySignup } = require("../middlewares");

router.get("/", [authJwt.verifyToken], settingsCtrl.getSettings);

router.patch("/", [authJwt.verifyToken], settingsCtrl.updateSettings);

/* router.get(
  "/",
  [authJwt.verifyToken, authJwt.isAdmin],
  companyCtrl.getCompanys
);

router.get(
  "/:companyId",
  [authJwt.verifyToken, authJwt.isAdmin],
  companyCtrl.getCompanyById
);

router.post(
  "/",
  [authJwt.verifyToken, authJwt.isAdmin],
  companyCtrl.createCompany
);

router.put(
  "/:companyId",
  [authJwt.verifyToken, authJwt.isAdmin],
  companyCtrl.updateCompanyById
);

router.delete(
  "/:companyId",
  [authJwt.verifyToken, authJwt.isAdmin],
  companyCtrl.deleteCompanyById
); */

module.exports = router;
