const QRCode = require('qrcode');

module.exports = async function generateQr(url) {
  try {
    const dataUrl = await QRCode.toDataURL(url, { errorCorrectionLevel: 'H' });
    return dataUrl;
  } catch (err) {
    throw err;
  }
};
