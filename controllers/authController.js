const util = require('util');
const cryptoUtil = require('./../utils/cryptoUtil');
const { catchAsync } = require('../error/error');
const {
  SUCCESS,
  HTTP_200_OK,
  HTTP_201_CREATED,
  HTTP_400_BAD_REQUEST,
  HTTP_401_UNAUTHORIZED,
  HTTP_403_FORBIDDEN,
  HTTP_404_NOT_FOUND,
  HTTP_500_INTERNAL_ERROR,
  ENV,
} = require('../utils/constant');

const emailSender = require('../utils/email');

const UserModel = require('./../models/userModel');
const AppError = require('./../error/appError');

exports.signUp = catchAsync(async function (req, res, next) {
  const newUser = await UserModel.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  createAndSendToken(newUser, HTTP_201_CREATED, res);
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
  createAndSendToken(user, HTTP_200_OK, res);
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
  const decodedData = await cryptoUtil.decodeJwtToken(token);

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

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) Get the user based on email + check if user exists
  const email = req.body.email;
  const user = await UserModel.findOne({ email });

  if (!user) {
    return next(
      new AppError(`There is no user with email ${email}`, HTTP_404_NOT_FOUND),
    );
  }

  //2) Generate a random token for reset
  const resetToken = user.createPasswordResetToken();
  //we need to save the user to db too. Add validation false to disable validation on other fields
  await user.save({ validateBeforeSave: false });

  //3) Send the token to user's email
  const emailOpts = prepareEmail(req, resetToken);
  try {
    await emailSender.sendEmail(emailOpts);

    res.status(HTTP_200_OK).json({
      status: SUCCESS,
      message: 'Token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error while sending email. Try again later!',
        HTTP_500_INTERNAL_ERROR,
      ),
    );
  }
});

function prepareEmail(req, resetToken) {
  const email = req.body.email;
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}\nIf you didn't forget your password, please ignore this email`;

  return {
    email,
    subject: 'Reset Your Password (Valid for 10 minutes)',
    message,
  };
}

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) Get the token from url
  const passwordResetToken = req.params.token;
  const hashedToken =
    cryptoUtil.createHashPasswordResetToken(passwordResetToken);

  //2) if token has not expired and user exists, set the new password
  //Find a user with such password reset token and has password expiry date/time beyond current time
  const user = await UserModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new AppError('Token is invalid or expired', HTTP_400_BAD_REQUEST),
    );
  }

  //3) update passwordChangedAt
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  //clear password token and expiry date
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //4) log user in, send back JWT
  createAndSendToken(user, HTTP_200_OK, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1) Get user from collection
  //req.user is available because we pre-fix this updatePassword with protect middleware
  const user = await UserModel.findById(req.user.id).select('+password');

  //2) check if posted current password is correct
  const { passwordCurrent, password, passwordConfirm } = req.body;

  if (!(await user.isCorrectPassword(passwordCurrent, user.password))) {
    return next(
      new AppError('Incorrect current password.', HTTP_401_UNAUTHORIZED),
    );
  }

  //3) if so, update the password
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();
  //user.findByIdAndUpdate will NOT work

  //4) log user in, send back JWT
  createAndSendToken(user, HTTP_200_OK, res);
});

function createAndSendToken(user, statusCode, res) {
  const token = cryptoUtil.signToken(user._id);
  res.status(statusCode).json({
    status: SUCCESS,
    token,
  });
}
