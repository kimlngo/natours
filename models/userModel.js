const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const cryptoUtil = require('./../utils/cryptoUtil');
const { USER, GUIDE, LEAD_GUIDE, ADMIN } = require('../utils/constant');

const PASSWORD = 'password';
const TEN_MINS_IN_MS = 10 * 60 * 1000;
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
    maxLength: [20, 'A user name should have at most 20 characters'],
    minLength: [1, 'A user name should have at least 1 character'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true, //transform email to lowercase
    validate: [validator.isEmail, 'Please provid a valid email'],
  },
  photo: String,
  role: {
    type: String,
    enum: [USER, GUIDE, LEAD_GUIDE, ADMIN],
    default: USER,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm a password'],
    validate: {
      //only works on CREATE & SAVE
      validator: function (input) {
        return input === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre(/^find/, function (next) {
  //this points to current query
  this.find({ active: { $ne: false } });
  next();
});

userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified(PASSWORD)) return next();

  //hash/encrypt password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified(PASSWORD) || this.isNew) return next();

  //The -1000 here is reducing the current time by 1second. This is to ensure that
  //the password reset time is < than the token issued at (iat).
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

//instance method - it's available on all document
userSchema.methods.isCorrectPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changesPasswordAfter = function (jwtTimestamp) {
  if (this.passwordChangedAt) {
    const passwordChangeTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
    );

    //if token's issued timestamp < password change time => password has been change and token is invalid, return true.
    return jwtTimestamp < passwordChangeTimestamp;
  }

  //false -> no password change
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = cryptoUtil.createRandomResetToken();

  this.passwordResetToken = cryptoUtil.createHashPasswordResetToken(resetToken);
  this.passwordResetExpires = Date.now() + TEN_MINS_IN_MS;

  return resetToken;
};

const UserModel = new mongoose.model('User', userSchema);

module.exports = UserModel;
