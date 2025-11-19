const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Resume = require('../models/Resume');
const generateSlug = require('../utils/generateSlug');
const generateQr = require('../utils/generateQr');
const generatePdf = require('../utils/generatePdf');

exports.createResume = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) return res.status(401).json({ message: 'Unauthorized - missing user' });
    const userId = req.user.id;

    // Log incoming request for debugging
    console.log('createResume request body keys:', Object.keys(req.body));
    console.log('createResume file:', req.file ? req.file.filename : null);

    // Normalize version payload: accept either
    // - req.body.version as JSON string (multipart),
    // - application/json body with the version fields, or
    // - multipart fields (title, summary, skills, etc.) directly.
    let version;
    if (req.body.version) {
      try {
        version = typeof req.body.version === 'string' ? JSON.parse(req.body.version) : req.body.version;
      } catch (parseErr) {
        console.error('Failed to parse version JSON:', parseErr);
        return res.status(400).json({ message: 'Invalid version JSON', details: parseErr.message });
      }
    } else {
      // Build version from body fields
      version = Object.assign({}, req.body);
      // If skills sent as JSON string or comma-separated, normalize to array
      if (typeof version.skills === 'string') {
        try {
          const parsed = JSON.parse(version.skills);
          if (Array.isArray(parsed)) version.skills = parsed;
          else version.skills = parsed ? [String(parsed)] : [];
        } catch (_) {
          // fallback to comma split
          version.skills = version.skills.split(',').map(s => s.trim()).filter(Boolean);
        }
      }
      // For experience/education/projects sent as JSON strings, try to parse
      ['experience', 'education', 'projects', 'languages'].forEach(key => {
        if (typeof version[key] === 'string') {
          try {
            const parsed = JSON.parse(version[key]);
            version[key] = parsed;
          } catch (_) {
            // leave as-is or wrap
          }
        }
      });
    }

    let contact = req.body.contact || {};
    if (typeof contact === 'string') {
      try {
        contact = JSON.parse(contact);
      } catch (contactErr) {
        console.error('Failed to parse contact JSON:', contactErr);
        contact = {};
      }
    }

    // Basic validation
    if (!version || (typeof version !== 'object')) return res.status(400).json({ message: 'Version data required' });

    const normalizedVersion = Object.assign({
      title: '',
      summary: '',
      experience: [],
      education: [],
      skills: [],
      languages: [],
      portfolioMedia: []
    }, version, {
      experience: Array.isArray(version.experience) ? version.experience : [],
      education: Array.isArray(version.education) ? version.education : [],
      skills: Array.isArray(version.skills) ? version.skills : [],
      languages: Array.isArray(version.languages) ? version.languages : [],
      portfolioMedia: Array.isArray(version.portfolioMedia) ? version.portfolioMedia : []
    });

    const contactInfo = (contact && typeof contact === 'object') ? contact : {};
    const publicSlug = generateSlug(normalizedVersion.title || contactInfo.fullName || req.user.name || 'resume');

    const resume = new Resume({
      user: userId,
      publicSlug,
      contact: contactInfo,
      profilePhotoUrl: req.file ? `/uploads/${req.file.filename}` : (normalizedVersion.profilePhotoUrl || ''),
      versions: [normalizedVersion]
    });

    await resume.save();

    let qrDataUrl = null;
    try {
      qrDataUrl = await generateQr(`${process.env.BASE_URL || ''}/r/${publicSlug}`);
    } catch (qrErr) {
      console.error('QR generation failed:', qrErr);
    }

    res.status(201).json({ resume, publicUrl: `/r/${publicSlug}`, qr: qrDataUrl });
  } catch (err) {
    console.error('Create resume error:', err);
    return res.status(500).json({ message: 'Failed to create resume', details: err.message });
  }
};

exports.getResume = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid resume id' });
    const resume = await Resume.findById(id).populate('user', 'name avatar');
    if (!resume) return res.status(404).json({ message: 'Not found' });
    res.json(resume);
  } catch (err) { next(err); }
};

exports.listMyResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ user: req.user.id }).sort({ updatedAt: -1 });
    res.json(resumes);
  } catch (err) { next(err); }
};

exports.addVersion = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid resume id' });
    const resume = await Resume.findById(id);
    if (!resume) return res.status(404).json({ message: 'Not found' });
    if (String(resume.user) !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    const version = req.body.version ? JSON.parse(req.body.version) : req.body;
    resume.versions.push(version);
    resume.currentVersionIndex = resume.versions.length - 1;
    await resume.save();
    res.json(resume);
  } catch (err) { next(err); }
};

exports.editVersion = async (req, res, next) => {
  try {
    const { id, vindex } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid resume id' });
    const resume = await Resume.findById(id);
    if (!resume) return res.status(404).json({ message: 'Not found' });
    if (String(resume.user) !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    const idx = parseInt(vindex, 10);
    if (isNaN(idx) || !resume.versions[idx]) return res.status(400).json({ message: 'Invalid version index' });

    const updates = req.body;
    resume.versions[idx] = Object.assign(resume.versions[idx].toObject(), updates);
    await resume.save();
    res.json(resume);
  } catch (err) { next(err); }
};

exports.deleteVersion = async (req, res, next) => {
  try {
    const { id, vindex } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid resume id' });
    const resume = await Resume.findById(id);
    if (!resume) return res.status(404).json({ message: 'Not found' });
    if (String(resume.user) !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    const idx = parseInt(vindex, 10);
    if (isNaN(idx) || !resume.versions[idx]) return res.status(400).json({ message: 'Invalid version index' });

    resume.versions.splice(idx, 1);
    if (resume.currentVersionIndex >= resume.versions.length) resume.currentVersionIndex = Math.max(0, resume.versions.length - 1);
    await resume.save();
    res.json(resume);
  } catch (err) { next(err); }
};

exports.setCurrentVersion = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid resume id' });
    const { index } = req.body;
    const resume = await Resume.findById(id);
    if (!resume) return res.status(404).json({ message: 'Not found' });
    if (String(resume.user) !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    const idx = parseInt(index, 10);
    if (isNaN(idx) || !resume.versions[idx]) return res.status(400).json({ message: 'Invalid index' });
    resume.currentVersionIndex = idx;
    await resume.save();
    res.json(resume);
  } catch (err) { next(err); }
};

exports.addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid resume id' });
    const resume = await Resume.findById(id);
    if (!resume) return res.status(404).json({ message: 'Not found' });
    const { authorName, email, text } = req.body;
    const comment = { authorName, email, text };
    resume.comments.push(comment);
    await resume.save();
    res.status(201).json(comment);
  } catch (err) { next(err); }
};

exports.getComments = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid resume id' });
    const resume = await Resume.findById(id).select('comments');
    if (!resume) return res.status(404).json({ message: 'Not found' });
    res.json(resume.comments);
  } catch (err) { next(err); }
};

exports.downloadPdf = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid resume id' });
    const resume = await Resume.findById(id).populate('user', 'name');
    if (!resume) return res.status(404).json({ message: 'Not found' });

    const version = resume.versions[resume.currentVersionIndex] || resume.versions[0];
    const template = req.query.template || 'classic';
    const htmlTemplatePath = path.join(__dirname, '..', 'templates', 'resumeTemplate.html');
    const html = fs.readFileSync(htmlTemplatePath, 'utf8');
    const pdfBuffer = await generatePdf(html, { resume, version, template });

    res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdfBuffer.length });
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Download PDF error:', err);
    res.status(500).json({ message: 'Failed to generate PDF', details: err.message });
  }
};

exports.getQr = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid resume id' });
    const resume = await Resume.findById(id);
    if (!resume) return res.status(404).json({ message: 'Not found' });
    const template = req.query.template || 'classic';
    const clientOrigin = req.get('origin');
    const baseUrl = process.env.PUBLIC_APP_URL || clientOrigin || process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const url = `${baseUrl}/r/${resume.publicSlug}?template=${template}`;
    const dataUrl = await generateQr(url);
    res.json({ dataUrl, url });
  } catch (err) { next(err); }
};

exports.uploadMedia = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid resume id' });
    const resume = await Resume.findById(id);
    if (!resume) return res.status(404).json({ message: 'Not found' });
    if (String(resume.user) !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    if (!req.file) return res.status(400).json({ message: 'No file' });
    resume.versions[resume.currentVersionIndex].portfolioMedia = resume.versions[resume.currentVersionIndex].portfolioMedia || [];
    resume.versions[resume.currentVersionIndex].portfolioMedia.push({ url: `/uploads/${req.file.filename}`, type: req.file.mimetype });
    await resume.save();
    res.json(resume);
  } catch (err) { next(err); }
};

exports.deleteMedia = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid resume id' });
    const resume = await Resume.findById(id);
    if (!resume) return res.status(404).json({ message: 'Not found' });
    if (String(resume.user) !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    const mediaId = req.params.mediaId;
    const arr = resume.versions[resume.currentVersionIndex].portfolioMedia || [];
    const idx = arr.findIndex(m => m._id && String(m._id) === mediaId || m.url && m.url.includes(mediaId));
    if (idx >= 0) arr.splice(idx, 1);
    await resume.save();
    res.json(resume);
  } catch (err) { next(err); }
};

// Simple skill inference - keyword matching (stub)
exports.inferSkills = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ skills: [], confidence: {} });
    const keywords = ['javascript','node','react','mongodb','express','sql','python','java','management','sales','driving'];
    const found = [];
    for (const k of keywords) {
      if (text.toLowerCase().includes(k)) found.push(k);
    }
    const confidence = {};
    found.forEach(f => { confidence[f] = 0.8; });
    res.json({ skills: found, confidence });
  } catch (err) { next(err); }
};

// Translation stub
exports.translateStub = async (req, res, next) => {
  try {
    const { text, target } = req.body;
    if (!text || !target) return res.status(400).json({ translated: '' });
    // stub: echo back
    res.json({ translated: text, target });
  } catch (err) { next(err); }
};
