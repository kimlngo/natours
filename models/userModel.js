const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
});

userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  //hash/encrypt password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

//instance method - it's available on all document
userSchema.methods.isCorrectPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
const UserModel = new mongoose.model('User', userSchema);

module.exports = UserModel;
