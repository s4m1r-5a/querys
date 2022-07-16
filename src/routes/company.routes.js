const { Router } = require("express");
const router = Router();

const companyCtrl = require("../controllers/company.controller");
const { authJwt, verifySignup } = require("../middlewares");

router.get("/", [authJwt.verifyToken, authJwt.isAdmin], companyCtrl.getCompanys);

router.get("/:companyId", [authJwt.verifyToken, authJwt.isAdmin], companyCtrl.getCompanyById);

router.post("/", [authJwt.verifyToken, authJwt.isAdmin], companyCtrl.createCompany);

router.put("/:companyId", [authJwt.verifyToken, authJwt.isAdmin], companyCtrl.updateCompanyById);

router.delete("/:companyId", [authJwt.verifyToken, authJwt.isAdmin], companyCtrl.deleteCompanyById);

module.exports = router;
