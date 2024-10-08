const {
  HTTP_500_INTERNAL_ERROR,
  ERROR,
  PROD,
  HTTP_400_BAD_REQUEST,
  HTTP_401_UNAUTHORIZED,
  ENV,
} = require('../utils/constant');
const AppError = require('./appError');

//constants
const CAST_ERROR = 'CastError';
const VALIDATION_ERROR = 'ValidationError';
const DUPLICATED_FIELD_CODE = 11000;
const INVALID_TOKEN_ERR = 'JsonWebTokenError';
const EXPIRED_TOKEN_ERR = 'TokenExpiredError';
const GENERIC_ERR_TITLE = 'Something went wrong!';
const GENERIC_ERR_MSG = 'Some wrong happened. Please try again later!';

exports.catchAsync = function (appliedFn) {
  return (req, res, next) => {
    appliedFn(req, res, next).catch(next);
  };
};

exports.errorHandler = function (err, req, res, next) {
  err.statusCode = err.statusCode || HTTP_500_INTERNAL_ERROR;
  err.status = err.status || ERROR;

  ENV.NODE_ENV.trim() === PROD
    ? sendProdError(err, req, res)
    : sendDevError(err, req, res);
};

function sendProdError(err, req, res) {
  const error = handleErrors(err);

  //A)API
  if (req.originalUrl.startsWith('/api')) handleProdAPIError(error, res);
  //B)RENDER Website
  else handleProdNonAPIError(error, res);
}

function handleErrors(err) {
  //handle MongoDB Error
  if (err.name === CAST_ERROR) {
    return handleCastError(err);
  } else if (err.code === DUPLICATED_FIELD_CODE) {
    return handleDuplicatedField(err);
  } else if (err.name === VALIDATION_ERROR) {
    return handleValidationError(err);

    //handle json web token error
  } else if (err.name === INVALID_TOKEN_ERR) {
    return handleInvalidTokenError();
  } else if (err.name === EXPIRED_TOKEN_ERR) {
    return handleExpiredTokenError();
  } else return err;
}

function handleCastError(err) {
  return new AppError(`Invalid ${err.path} ${err.value}`, HTTP_400_BAD_REQUEST);
}

function handleDuplicatedField(err) {
  return new AppError(
    `Duplicated field value '${err.keyValue.name}'`,
    HTTP_400_BAD_REQUEST,
  );
}

function handleValidationError(err) {
  const message = `Invalid input data. ${Object.values(err.errors)
    .map(el => el.message)
    .join('. ')}`;
  return new AppError(message, HTTP_400_BAD_REQUEST);
}

function handleInvalidTokenError() {
  return new AppError(
    'Invalid token. Please login again!',
    HTTP_401_UNAUTHORIZED,
  );
}

function handleExpiredTokenError() {
  return new AppError(
    'Your token has expired. Please login again!',
    HTTP_401_UNAUTHORIZED,
  );
}

function handleProdAPIError(err, res) {
  //Operational error ==> trusted, send back to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    //Programming or other unknown error: don't leak error details
  } else {
    res.status(HTTP_500_INTERNAL_ERROR).json({
      status: ERROR,
      message: GENERIC_ERR_MSG,
    });
  }
}

function handleProdNonAPIError(err, res) {
  if (err.isOperational) {
    res.status(err.statusCode).render('error', {
      title: GENERIC_ERR_TITLE,
      msg: err.message,
    });
    //Programming or other unknown error: don't leak error details
  } else {
    res.status(err.statusCode).render('error', {
      title: GENERIC_ERR_TITLE,
      msg: GENERIC_ERR_MSG,
    });
  }
}

function sendDevError(err, req, res) {
  //API
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  } else {
    //RENDERED Website
    res.status(err.statusCode).render('error', {
      title: GENERIC_ERR_TITLE,
      msg: err.message,
    });
  }
}
