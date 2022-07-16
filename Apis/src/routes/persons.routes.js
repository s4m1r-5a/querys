const { Router } = require('express');
const router = Router();

const personCtrl = require('../controllers/persons.controller');
const { authJwt, verifySignup } = require('../middlewares');

router.get('/', [authJwt.verifyToken], personCtrl.getPersons);

router.get('/:personId', [authJwt.verifyToken], personCtrl.getPersonById);

router.post('/:personType', [authJwt.verifyToken], personCtrl.createPerson);

router.put('/:personId', [authJwt.verifyToken], personCtrl.updatePersonById);

router.patch('/:personId', [authJwt.verifyToken], personCtrl.updatePersonById);

router.delete(
  '/:personId',
  [authJwt.verifyToken, authJwt.isAdmin],
  personCtrl.deletePersonById
);

module.exports = router;
