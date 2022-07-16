const { Router } = require('express');
const router = Router();

const wtspCtrl = require('../controllers/wtsp.controller');
const { authJwt } = require('../middlewares');

router.get('/qr', authJwt.verifyTradeToken, wtspCtrl.getQr);
router.post('/qr', authJwt.verifyTradeToken, wtspCtrl.postQr);

router.post('/conection', authJwt.verifyTradeToken, wtspCtrl.conection);
router.post('/sendText', authJwt.verifyTradeToken, wtspCtrl.sendText);
router.post('/sendListMenu', authJwt.verifyTradeToken, wtspCtrl.sendListMenu);
router.post('/sendButtons', authJwt.verifyTradeToken, wtspCtrl.sendButtons);
router.post('/sendVoice', authJwt.verifyTradeToken, wtspCtrl.sendVoice);
router.post(
  '/sendVoiceBase64',
  authJwt.verifyTradeToken,
  wtspCtrl.sendVoiceBase64
);
router.post(
  '/sendContactVcard',
  authJwt.verifyTradeToken,
  wtspCtrl.sendContactVcard
);
router.post(
  '/sendContactVcardList',
  authJwt.verifyTradeToken,
  wtspCtrl.sendContactVcardList
);
router.post('/sendLocation', authJwt.verifyTradeToken, wtspCtrl.sendLocation);
router.post(
  '/sendLinkPreview',
  authJwt.verifyTradeToken,
  wtspCtrl.sendLinkPreview
);
router.post('/sendImage', authJwt.verifyTradeToken, wtspCtrl.sendImage);
router.post(
  '/sendImageFromBase64',
  authJwt.verifyTradeToken,
  wtspCtrl.sendImageFromBase64
);
router.post('/sendFile', authJwt.verifyTradeToken, wtspCtrl.sendFile);
router.post(
  '/sendFileFromBase64',
  authJwt.verifyTradeToken,
  wtspCtrl.sendFileFromBase64
);
router.post(
  '/sendImageAsStickerGif',
  authJwt.verifyTradeToken,
  wtspCtrl.sendImageAsStickerGif
);
router.post(
  '/sendImageAsSticker',
  authJwt.verifyTradeToken,
  wtspCtrl.sendImageAsSticker
);
router.post(
  '/forwardMessages',
  authJwt.verifyTradeToken,
  wtspCtrl.forwardMessages
);
router.post('/sendMentioned', authJwt.verifyTradeToken, wtspCtrl.sendMentioned);
router.post('/reply', authJwt.verifyTradeToken, wtspCtrl.reply);
router.post(
  '/sendMessageOptions',
  authJwt.verifyTradeToken,
  wtspCtrl.sendMessageOptions
);
router.post(
  '/sendMessageOptions',
  authJwt.verifyTradeToken,
  wtspCtrl.sendMessageOptions
);

/* router.get("/:productId", wtspCtrl.getProductById);
 
router.post(
  "/",
  [authJwt.verifyToken, authJwt.isAdmin],
  productsCtrl.createProduct
);

router.put(
  "/:productId",
  [authJwt.verifyToken, authJwt.isAdmin],
  productsCtrl.updateProductById
);

router.delete(
  "/:productId",
  [authJwt.verifyToken, authJwt.isAdmin],
  productsCtrl.deleteProductById
); */

module.exports = router;
