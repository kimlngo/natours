const crypto = require('crypto');
const util = require('util');
const jwt = require('jsonwebtoken');
const { ENV, HEX, SHA256 } = require('./constant');

exports.createRandomToken = function () {
  return crypto.randomBytes(32).toString(HEX);
};

exports.createHashToken = function (rawResetToken) {
  return crypto.createHash(SHA256).update(rawResetToken).digest(HEX);
};

exports.decodeJwtToken = function (token) {
  return util.promisify(jwt.verify)(token, ENV.JWT_SECRET);
};

exports.signToken = function (id) {
  return jwt.sign({ id }, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN,
  });
};
