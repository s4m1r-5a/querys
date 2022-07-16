const { Router } = require("express");
const router = Router();

const usersCtrl = require("../controllers/users.controller");
const { authJwt, verifySignup } = require("../middlewares");

router.get(
  "/" /* [
  authJwt.verifyToken,
  authJwt.isAdmin
], */,
  usersCtrl.getUsers
);

router.get("/:userId", usersCtrl.getUserById);

router.post(
  "/",
  /* [
    authJwt.verifyToken ,
    authJwt.isAdmin,
    verifySignup.checkDuplicateUsernameOrEmail,
  ], */
  usersCtrl.createUser
);

router.put("/:userId", /* [authJwt.verifyToken], */ usersCtrl.updateUser);

router.delete("/:userId", [authJwt.verifyToken], usersCtrl.deleteUser);

module.exports = router;
