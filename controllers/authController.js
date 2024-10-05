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
  PROD,
} = require('../utils/constant');

const Email = require('../utils/email');

const UserModel = require('./../models/userModel');
const AppError = require('./../error/appError');

exports.signUp = catchAsync(async function (req, res, next) {
  const newUser = await UserModel.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  //http://localhost:8080/me
  const url = `${req.protocol}://${req.get('host')}/me`;
  // const url = `${req.protocol}://localhost:8080/me`;

  await new Email(newUser, url).sendWelcome();
  createAndSendToken(newUser, HTTP_201_CREATED, res);
});

exports.signUpWithEmailConfirm = catchAsync(async function (req, res, next) {
  const newUser = await UserModel.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  //Create confirm email token
  const confirmToken = newUser.createConfirmEmailToken();
  await newUser.save({ validateBeforeSave: false });

  //Send the token to user's email
  try {
    const url = `${req.protocol}://${req.get('host')}/api/v1/users/confirmEmail/${confirmToken}`;
    await new Email(newUser, url).sendConfirmEmail();

    res.status(HTTP_200_OK).json({
      status: SUCCESS,
      message: 'Email Confirm Token sent to email',
    });
  } catch (err) {
    newUser.emailConfirmToken = undefined;
    newUser.emailConfirmExpires = undefined;
    await newUser.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error while sending email. Try again later!',
        HTTP_500_INTERNAL_ERROR,
      ),
    );
  }
});

exports.confirmEmail = catchAsync(async (req, res, next) => {
  //Get the token from request
  const confirmToken = req.params.token;
  const hashedToken = cryptoUtil.createHashToken(confirmToken);

  //Check if both the token is valid and still within 10 minutes
  const user = await UserModel.findOne({
    emailConfirmToken: hashedToken,
    emailConfirmExpires: { $gt: Date.now() },
  });
  //If no => return error
  if (!user) {
    return next(
      new AppError('Token is invalid or expired', HTTP_400_BAD_REQUEST),
    );
  }
  //If yes => log user in
  user.emailConfirm = true;
  user.emailConfirmToken = undefined;
  user.emailConfirmExpires = undefined;

  await user.save({ validateBeforeSave: false });

  createAndSendToken(user, HTTP_200_OK, res);
});

exports.verifyEmailConfirmation = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1) check if email & password are passed in
  if (!email || !password) {
    return next(
      new AppError('Please provide email & password!', HTTP_400_BAD_REQUEST),
    );
  }

  const user = await UserModel.findOne({
    email,
    emailConfirm: true,
  })
    .select('+password')
    .select('+failLoginCount');

  if (!user) {
    return next(
      new AppError('Please confirm email before log in', HTTP_400_BAD_REQUEST),
    );
  }

  //save the user for next middleware login
  req.user = user;
  next();
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(
      new AppError('Please provide email and password!', HTTP_400_BAD_REQUEST),
    );
  }
  // 2) Check if user exists && password is correct
  const user = await UserModel.findOne({ email }).select('+password');

  if (!user || !(await user.isCorrectPassword(password, user.password))) {
    return next(
      new AppError('Incorrect email or password', HTTP_401_UNAUTHORIZED),
    );
  }

  // 3) If everything ok, send token to client
  createAndSendToken(user, 200, res);
});

exports.logout = (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(HTTP_200_OK).json({
    status: SUCCESS,
  });
};

// exports.login = catchAsync(async (req, res, next) => {
//   const { password } = req.body;

//   //Get user from req
//   const user = req.user;

//   if (user.isBelowMaxLoginAttempt() || user.isLockDurationPassed()) {
//     if (!(await user.isCorrectPassword(password, user.password))) {
//       user.failLoginCount =
//         (user.failLoginCount % (ENV.MAX_LOGIN_ATTEMPT - 1)) + 1;

//       await user.save({ validateBeforeSave: false });

//       return next(new AppError('Incorrect password!', HTTP_401_UNAUTHORIZED));
//     }
//   } else {
//     //User has attempted 5 times
//     user.setNextLoginAt();
//     await user.save({ validateBeforeSave: false });

//     const nextDate = user.nextLoginAt.toLocaleDateString();
//     const nextTime = user.nextLoginAt.toLocaleTimeString();
//     return next(
//       new AppError(
//         `You has exceeded 5 login attempts, please try again after ${nextDate} ${nextTime}`,
//         HTTP_401_UNAUTHORIZED,
//       ),
//     );
//   }

//   //3) return the token
//   user.failLoginCount = 0;
//   user.nextLoginAt = undefined;
//   await user.save({ validateBeforeSave: false });
//   createAndSendToken(user, HTTP_200_OK, res);
// });

exports.protect = catchAsync(async (req, res, next) => {
  //1) check if token exists in req headers
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
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
  res.locals.user = curUser;
  next();
});

//Only for render pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      //1) verify token
      const decodedData = await cryptoUtil.decodeJwtToken(req.cookies.jwt);

      //2) check if user still exists
      const curUser = await UserModel.findById(decodedData.id);
      if (!curUser) {
        return next();
      }
      //3) check if user changed password after the token was issued
      if (curUser.changesPasswordAfter(decodedData.iat)) {
        return next();
      }

      //4) There is a logged in user
      //this user will be avail in pug template
      res.locals.user = curUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

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
  try {
    const url = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    await new Email(user, url).sendPasswordReset();

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

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) Get the token from url
  const passwordResetToken = req.params.token;
  const hashedToken = cryptoUtil.createHashToken(passwordResetToken);

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

  //3) update password & passwordConfirm
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

  //implement saving jwt to res's cookie
  res.cookie('jwt', token, createCookieOpts());

  //Remove password from the output
  user.password = undefined;
  user.failLoginCount = undefined;

  res.status(statusCode).json({
    status: SUCCESS,
    token,
    data: {
      user,
    },
  });
}

function createCookieOpts() {
  const opts = {
    expires: new Date(
      Date.now() + ENV.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true, //only be used by browser
  };

  //only enable secure in Production
  if (ENV.NODE_ENV.trim() === PROD) opts.secure = true;
  return opts;
}
