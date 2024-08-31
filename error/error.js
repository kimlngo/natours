const {
  HTTP_500_INTERNAL_ERROR,
  ERROR,
  DEV,
  PROD,
} = require('../utils/constant');

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

exports.errorHandler = function (err, req, res, next) {
  err.statusCode = err.statusCode || HTTP_500_INTERNAL_ERROR;
  err.status = err.status || ERROR;

  if (process.env.NODE_ENV.trim() === PROD) {
    sendProdError(err, res);
  } else {
    sendDevError(err, res);
  }
};

exports.catchAsync = function (appliedFn) {
  return (req, res, next) => {
    appliedFn(req, res, next).catch(next);
  };
};
