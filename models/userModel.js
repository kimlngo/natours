const mongoose = require('mongoose');
const validator = require('validator');

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
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm a password'],
  },
});

const UserModel = new mongoose.model('User', userSchema);

module.exports = UserModel;
