const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');
const resumeCtrl = require('../controllers/resumeController');

router.use(protect);

// router.post('/', upload.single('profilePhoto'), resumeCtrl.createResume);
router.get('/me', resumeCtrl.listMyResumes);
router.get('/:id', resumeCtrl.getResume);
router.post('/:id/versions', resumeCtrl.addVersion);
router.patch('/:id/versions/:vindex', resumeCtrl.editVersion);
router.delete('/:id/versions/:vindex', resumeCtrl.deleteVersion);
router.patch('/:id/current-version', resumeCtrl.setCurrentVersion);
router.post('/:id/comments', resumeCtrl.addComment);
router.get('/:id/comments', resumeCtrl.getComments);
router.get('/:id/pdf', resumeCtrl.downloadPdf);
router.get('/:id/qr', resumeCtrl.getQr);
// router.post('/:id/media', upload.single('media'), resumeCtrl.uploadMedia);
router.delete('/:id/media/:mediaId', resumeCtrl.deleteMedia);

module.exports = router;
