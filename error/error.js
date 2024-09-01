const {
  HTTP_500_INTERNAL_ERROR,
  ERROR,
  PROD,
  HTTP_400_BAD_REQUEST,
} = require('../utils/constant');
const AppError = require('./appError');

//constants
const CAST_ERROR = 'CastError';
const VALIDATION_ERROR = 'ValidationError';
const DUPLICATED_FIELD_CODE = 11000;

exports.catchAsync = function (appliedFn) {
  return (req, res, next) => {
    appliedFn(req, res, next).catch(next);
  };
};

exports.errorHandler = function (err, req, res, next) {
  err.statusCode = err.statusCode || HTTP_500_INTERNAL_ERROR;
  err.status = err.status || ERROR;

  if (process.env.NODE_ENV.trim() === PROD) {
    let errCopy = handleMongoDBErrors(err);
    sendProdError(errCopy, res);
  } else {
    sendDevError(err, res);
  }
};

function sendDevError(err, res) {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
}

function sendProdError(err, res) {
  //Operational error ==> trusted, send back to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    //Programming or other unknown error: don't leak error details
  } else {
    console.error(`ERROR 💥 ${err}`);
    res.status(HTTP_500_INTERNAL_ERROR).json({
      status: ERROR,
      message: 'Some errors happened. Please try again later!',
    });
  }
}

function handleMongoDBErrors(err) {
  //handle MongoDB Error
  if (err.name === CAST_ERROR) {
    return handleCastError(err);
  } else if (err.code === DUPLICATED_FIELD_CODE) {
    return handleDuplicatedField(err);
  } else if (err.name === VALIDATION_ERROR) {
    return handleValidationError(err);
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
