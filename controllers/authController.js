const { catchAsync } = require('../error/error');
const {
  HTTP_201_CREATED,
  SUCCESS,
  HTTP_400_BAD_REQUEST,
  HTTP_200_OK,
  HTTP_401_UNAUTHORIZED,
} = require('../utils/constant');

const jwt = require('jsonwebtoken');
const UserModel = require('./../models/userModel');
const AppError = require('./../error/appError');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signUp = catchAsync(async function (req, res, next) {
  const newUser = await UserModel.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(newUser._id);

  res.status(HTTP_201_CREATED).json({
    status: SUCCESS,
    token: token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1) check if email & password are passed in
  if (!email || !password) {
    return next(
      new AppError('Please provide email & password!', HTTP_400_BAD_REQUEST),
    );
  }

  //2) check if user exist and password match
  const user = await UserModel.findOne({ email }).select('+password');

  if (!user || !(await user.isCorrectPassword(password, user.password))) {
    return next(
      new AppError('Incorrect email or password!', HTTP_401_UNAUTHORIZED),
    );
  }

  //3) return the token
  const token = signToken(user._id);
  res.status(HTTP_200_OK).json({
    status: SUCCESS,
    token,
  });
});
