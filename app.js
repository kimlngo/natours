const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routers/tourRouter');
const userRouter = require('./routers/userRouter');
const {
  HTTP_NOT_FOUND,
  FAIL,
  HTTP_INTERNAL_ERROR,
  ERROR,
} = require('./utils/constant');

const app = express();

// MIDDLEWARES
if (process.env.NODE_ENV.trim() === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());

// Access static files
app.use(express.static(`${__dirname}/public`));

//add request timestamp to request object using middleware
app.use((req, res, next) => {
  req.timeStamp = new Date().toISOString();
  next();
});

// ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Default 404 Route
app.all('*', (req, res, next) => {
  const err = new Error(`Cannot find ${req.originalUrl}`);
  err.statusCode = HTTP_NOT_FOUND;
  err.status = FAIL;

  //calling next() with err as param will skip all other middlewares and forward straight to the error handling middleware.
  next(err);
});

//Global error handling middlware
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || HTTP_INTERNAL_ERROR;
  err.status = err.status || ERROR;

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

module.exports = app;
