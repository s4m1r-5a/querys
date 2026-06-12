const { Router } = require('express');
const router = Router();

const queryCtrl = require('../controllers/query.controller');

router.post('/document', queryCtrl.document);
router.post('/document/challenge', queryCtrl.answerDocumentChallenge);

// Backward-compatible aliases for existing clients.
router.post('/entity', queryCtrl.document);
router.post('/person', queryCtrl.person);
router.post('/company', queryCtrl.company);

router.post('/usury', queryCtrl.usury);

module.exports = router;
