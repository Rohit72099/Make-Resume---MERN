const PDFDocument = require('pdfkit');

const templateStyles = {
  classic: {
    nameColor: '#1D4ED8',
    accentColor: '#2563EB',
    headerBg: null,
    bodyText: '#111111',
    accentBadge: '#DBEAFE',
  },
  modern: {
    nameColor: '#F8FAFC',
    accentColor: '#38BDF8',
    headerBg: '#0F172A',
    bodyText: '#E2E8F0',
    accentBadge: '#1E293B',
  },
  minimalist: {
    nameColor: '#0F172A',
    accentColor: '#0EA5E9',
    headerBg: '#F8FAFC',
    bodyText: '#1F2937',
    accentBadge: '#E2E8F0',
  },
  developer: {
    nameColor: '#34D399',
    accentColor: '#60A5FA',
    headerBg: '#0B1120',
    bodyText: '#CBD5F5',
    accentBadge: '#1E293B',
  },
  creative: {
    nameColor: '#F472B6',
    accentColor: '#8B5CF6',
    headerBg: '#1F2937',
    bodyText: '#1F2937',
    accentBadge: '#FEE2E2',
  },
};

async function generatePdf(_htmlTemplate, context = {}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      const { resume, version, template = 'classic' } = context;
      const styles = templateStyles[template] || templateStyles.classic;
      const contact = resume?.contact || {};
      const name = contact.fullName || resume?.user?.name || 'Resume';

      if (styles.headerBg) {
        doc.rect(doc.page.margins.left - 20, doc.y, doc.page.width - doc.page.margins.left - doc.page.margins.right + 40, 80)
          .fill(styles.headerBg);
        doc.fillColor(styles.nameColor).fontSize(26).text(name, { continued: false });
        if (version?.title) {
          doc.moveDown(0.2);
          doc.fillColor(styles.accentColor).fontSize(14).text(version.title);
        }
        doc.moveDown();
        doc.fillColor(styles.bodyText).fontSize(11);
      } else {
        doc.fillColor(styles.nameColor).fontSize(24).text(name);
        if (version?.title) {
          doc.moveDown(0.2);
          doc.fillColor(styles.accentColor).fontSize(14).text(version.title);
        }
        doc.moveDown();
      }

      doc.fillColor(styles.bodyText).fontSize(11);
      if (version?.title) {
        doc.moveDown(0.2);
        doc.fillColor(styles.accentColor).fontSize(14).text(version.title);
      }
      doc.moveDown();

      const contactLines = [
        contact.email && `Email: ${contact.email}`,
        contact.phone && `Phone: ${contact.phone}`,
        contact.location && `Location: ${contact.location}`,
        contact.linkedIn && `LinkedIn: ${contact.linkedIn}`,
        contact.portfolio && `Portfolio: ${contact.portfolio}`,
      ].filter(Boolean);

      if (contactLines.length) {
        const contactColor = styles.headerBg ? '#E2E8F0' : styles.bodyText;
        doc.fillColor(contactColor).opacity(styles.headerBg ? 0.9 : 0.8).fontSize(11);
        contactLines.forEach((line) => doc.text(line));
        doc.moveDown();
        doc.opacity(1);
      }

      if (version?.summary) {
        addSection(doc, 'Summary', () => {
          doc.fillColor(styles.bodyText).fontSize(12).text(version.summary);
        }, styles);
      }

      if (Array.isArray(version?.experience) && version.experience.length) {
        addSection(doc, 'Experience', () => {
          version.experience.forEach((exp, index) => {
            addExperience(doc, exp, styles);
            if (index < version.experience.length - 1) doc.moveDown(0.5);
          });
        }, styles);
      }

      if (Array.isArray(version?.education) && version.education.length) {
        addSection(doc, 'Education', () => {
          version.education.forEach((edu, index) => {
            addEducation(doc, edu, styles);
            if (index < version.education.length - 1) doc.moveDown(0.4);
          });
        }, styles);
      }

      if (Array.isArray(version?.skills) && version.skills.length) {
        addSection(doc, 'Skills', () => {
          doc.fillColor(styles.bodyText).fontSize(12);
          doc.list(version.skills, { bulletRadius: 2 });
        }, styles);
      }

      if (Array.isArray(version?.languages) && version.languages.length) {
        addSection(doc, 'Languages', () => {
          version.languages.forEach((lang) => {
            const detail = [lang.name, lang.proficiency ? `(${lang.proficiency})` : null]
              .filter(Boolean)
              .join(' ');
            doc.fillColor(styles.bodyText).fontSize(12).text(detail);
          });
        }, styles);
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

function addSection(doc, title, renderFn, styles = templateStyles.classic) {
  doc.fillColor(styles.bodyText).fontSize(16).text(title);
  doc.moveDown(0.3);
  renderFn();
  doc.moveDown();
}

function addExperience(doc, exp = {}, styles = templateStyles.classic) {
  const title = exp.title || 'Role';
  const company = exp.company ? ` • ${exp.company}` : '';
  doc.fillColor(styles.bodyText).fontSize(13).text(`${title}${company}`);

  const location = exp.location || '';
  const dateRange = formatDateRange(exp.startDate, exp.endDate, exp.current);
  const meta = [location, dateRange].filter(Boolean).join(' • ');
  if (meta) {
    doc.fillColor('#666666').fontSize(11).text(meta);
  }

  if (exp.description) {
    doc.fillColor(styles.bodyText).fontSize(12).text(exp.description);
  }
}

function addEducation(doc, edu = {}, styles = templateStyles.classic) {
  const degree = edu.degree || 'Program';
  const institution = edu.institution ? ` • ${edu.institution}` : '';
  doc.fillColor(styles.bodyText).fontSize(13).text(`${degree}${institution}`);

  const details = [
    edu.location,
    edu.graduationYear,
    edu.grade ? `Grade: ${edu.grade}` : null,
  ].filter(Boolean).join(' • ');

  if (details) {
    doc.fillColor('#666666').fontSize(11).text(details);
  }
}

function formatDateRange(start, end, current) {
  const startText = start || '';
  const endText = current ? 'Present' : (end || '');

  if (!startText && !endText) return '';
  if (!startText) return endText;
  if (!endText) return startText;
  return `${startText} - ${endText}`;
}

module.exports = generatePdf;
