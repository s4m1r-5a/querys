const { Router } = require('express');
const router = Router();

const queryCtrl = require('../controllers/query.controller');
const { authJwt } = require('../middlewares');

router.post('/entity', authJwt.verifyTradeToken, queryCtrl.entity);

router.post('/person', authJwt.verifyTradeToken, queryCtrl.person);

router.post('/company', authJwt.verifyTradeToken, queryCtrl.company);

router.post('/usury', authJwt.verifyTradeToken, queryCtrl.usury);

module.exports = router;
