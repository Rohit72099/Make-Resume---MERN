const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, index: true },
  avatar: { type: String },
  phone: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
