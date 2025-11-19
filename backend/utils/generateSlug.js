const slugify = require('slugify');
const crypto = require('crypto');

module.exports = function generateSlug(text) {
  const base = (text || 'resume').toString().toLowerCase();
  const slug = slugify(base, { lower: true, strict: true });
  const id = crypto.randomBytes(3).toString('hex'); // 6 chars hex
  return `${slug}-${id}`;
};
