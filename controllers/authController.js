const util = require('util');
const { catchAsync } = require('../error/error');
const {
  SUCCESS,
  HTTP_200_OK,
  HTTP_201_CREATED,
  HTTP_400_BAD_REQUEST,
  HTTP_401_UNAUTHORIZED,
  HTTP_403_FORBIDDEN,
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
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
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

exports.protect = catchAsync(async (req, res, next) => {
  //1) check if token exists in req headers
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError(
        'You are not logged in! Please login to get access',
        HTTP_401_UNAUTHORIZED,
      ),
    );
  }
  //2) verify token
  const decodedData = await util.promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET,
  );

  //3) check if user still exists
  const curUser = await UserModel.findById(decodedData.id);
  if (!curUser) {
    return next(
      new AppError(
        'The token belongs to a non-existing user',
        HTTP_401_UNAUTHORIZED,
      ),
    );
  }
  //4) check if user changed password after the token was issued
  if (curUser.changesPasswordAfter(decodedData.iat)) {
    return next(
      new AppError(
        'User has recently changed password! Please login again',
        HTTP_401_UNAUTHORIZED,
      ),
    );
  }

  //5) valid token, GRANT ACCESS TO PROTECTED ROUTE
  req.user = curUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //if user's role is not admin/lead-guide => return error

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'You do not have permission to perform this action!',
          HTTP_403_FORBIDDEN,
        ),
      );
    }

    next();
  };
};
