const {
  HTTP_500_INTERNAL_ERROR: HTTP_INTERNAL_ERROR,
  ERROR,
} = require('../utils/constant');

exports.errorHandler = function (err, req, res, next) {
  err.statusCode = err.statusCode || HTTP_INTERNAL_ERROR;
  err.status = err.status || ERROR;

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

exports.catchAsync = function (appliedFn) {
  return (req, res, next) => {
    appliedFn(req, res, next).catch(next);
  };
};
