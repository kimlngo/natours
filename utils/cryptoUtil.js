const crypto = require('crypto');
const { HEX, SHA256 } = require('./constant');

exports.createRandomResetToken = function () {
  return crypto.randomBytes(32).toString(HEX);
};

exports.createHashPasswordResetToken = function (rawResetToken) {
  return crypto.createHash(SHA256).update(rawResetToken).digest(HEX);
};
