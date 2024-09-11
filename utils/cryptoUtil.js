const crypto = require('crypto');
const { HEX, SHA256 } = require('./constant');

exports.createHashPasswordResetToken = function (rawResetToken) {
  return crypto.createHash(SHA256).update(rawResetToken).digest(HEX);
};
