const { Router } = require("express");
const router = Router();

const symbolsCtrl = require("../controllers/symbols.controller");
const { authJwt } = require("../middlewares");

router.get("/", [authJwt.verifyToken], symbolsCtrl.getSymbols);

router.get("/:symbol", [authJwt.verifyToken], symbolsCtrl.getOneSymbol);

router.patch("/:symbol", [authJwt.verifyToken], symbolsCtrl.updateSymbol);

router.post("/sync", [authJwt.verifyToken], symbolsCtrl.syncSymbol);

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
