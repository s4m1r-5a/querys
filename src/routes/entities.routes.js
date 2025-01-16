const { Router } = require('express');
const router = Router();

const entityCtrl = require('../controllers/entity.controller');
const { authJwt, verifySignup } = require('../middlewares');

router.get('/', [authJwt.verifyToken], entityCtrl.getEntities);

router.get('/:entityId', [authJwt.verifyToken], entityCtrl.getEntityById);

router.post('/:entityType', [authJwt.verifyToken], entityCtrl.createEntity);

router.put('/:entityId', [authJwt.verifyToken], entityCtrl.updateEntityById);

router.patch('/:entityId', [authJwt.verifyToken], entityCtrl.updateEntityById);

router.delete(
  '/:entityId',
  [authJwt.verifyToken, authJwt.isAdmin],
  entityCtrl.deleteEntity
);

module.exports = router;
