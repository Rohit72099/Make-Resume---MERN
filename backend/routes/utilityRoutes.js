const express = require('express');
const router = express.Router();
const resumeCtrl = require('../controllers/resumeController');

router.post('/skills/infer', resumeCtrl.inferSkills);
router.post('/translate', resumeCtrl.translateStub);

module.exports = router;
