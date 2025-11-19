const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  authorName: { type: String },
  email: { type: String },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const resumeVersionSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  summary: { type: String, default: '' },
  skills: { type: [String], default: [] },
  experience: {
    type: [{
      title: { type: String, default: '' },
      company: { type: String, default: '' },
      location: { type: String, default: '' },
      startDate: { type: String, default: '' },
      endDate: { type: String, default: '' },
      current: { type: Boolean, default: false },
      description: { type: String, default: '' }
    }],
    default: []
  },
  education: {
    type: [{
      degree: { type: String, default: '' },
      institution: { type: String, default: '' },
      location: { type: String, default: '' },
      graduationYear: { type: String, default: '' },
      grade: { type: String, default: '' }
    }],
    default: []
  },
  projects: {
    type: [{
      name: { type: String, default: '' },
      description: { type: String, default: '' },
      link: { type: String, default: '' }
    }],
    default: []
  },
  portfolioMedia: {
    type: [{
      url: { type: String, default: '' },
      type: { type: String, default: 'link' },
      caption: { type: String, default: '' }
    }],
    default: []
  },
  languages: {
    type: [{
      name: { type: String, default: '' },
      proficiency: { type: String, default: '' }
    }],
    default: []
  },
  trustScore: { type: Number, default: 0 },
  inferredSkills: { type: [String], default: [] },
  source: { type: String, enum: ['form', 'chat', 'voice'], default: 'form' }
}, { timestamps: true });

const resumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  publicSlug: { type: String, required: true, unique: true },
  contact: {
    fullName: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    linkedIn: { type: String, default: '' },
    portfolio: { type: String, default: '' }
  },
  profilePhotoUrl: String,
  versions: [resumeVersionSchema],
  currentVersionIndex: { type: Number, default: 0 },
  comments: [commentSchema]
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
