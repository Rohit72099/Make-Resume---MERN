const Resume = require('../models/Resume');
const generateQr = require('../utils/generateQr');

exports.getPublicResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ publicSlug: req.params.slug }).populate('user', 'name avatar');
    if (!resume) return res.status(404).json({ message: 'Not found' });

    const safe = {
      user: { name: resume.user.name, avatar: resume.user.avatar },
      publicSlug: resume.publicSlug,
      contact: resume.contact,
      profilePhotoUrl: resume.profilePhotoUrl,
      versions: resume.versions,
      currentVersionIndex: resume.currentVersionIndex,
      comments: resume.comments
    };
    res.json(safe);
  } catch (err) { next(err); }
};

exports.getPublicQr = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ publicSlug: req.params.slug });
    if (!resume) return res.status(404).json({ message: 'Not found' });
    const url = `${process.env.BASE_URL || ''}/r/${resume.publicSlug}`;
    const dataUrl = await generateQr(url);
    // return as png buffer
    const base64 = dataUrl.split(',')[1];
    const img = Buffer.from(base64, 'base64');
    res.set('Content-Type', 'image/png');
    res.send(img);
  } catch (err) { next(err); }
};
