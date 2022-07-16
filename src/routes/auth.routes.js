const { Router } = require('express');
const router = Router();

const authCtrl = require('../controllers/auth.controller');
const { verifySignup, authJwt } = require('../middlewares');

router.use((req, res, next) => {
  res.header(
    'Access-Control-Allow-Headers',
    'x-access-token, Origin, Content-Type, Accept'
  );
  next();
});

router.post(
  '/signup',
  [verifySignup.checkDuplicateUsernameOrEmail, verifySignup.checkRolesExisted],
  authCtrl.signUp
);
//router.post('/googlesignup', authCtrl.googleSignup);
//router.post('/facebooksignup', authCtrl.facebookSignup);

router.post('/signin', authCtrl.signin);
//router.post('/googlelogin', authCtrl.googleLogin);
//router.post('/facebooklogin', authCtrl.facebookLogin);

router.post('/logout', authJwt.verifyToken, authCtrl.logout);

router.get('/whoami', authJwt.verifyToken, authCtrl.whoami);

router.put('/forgot-password', authCtrl.forgetPass); // /forgotten-password
router.put('/reset-password', authCtrl.resetPass);

router.post('/generate-token', authCtrl.token);

module.exports = router;
