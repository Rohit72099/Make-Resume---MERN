const express = require('express');
const router = express.Router();
const publicCtrl = require('../controllers/publicController');

router.get('/resume/:slug', publicCtrl.getPublicResume);
router.get('/qr/:slug', publicCtrl.getPublicQr);

module.exports = router;
