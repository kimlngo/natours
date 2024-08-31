const express = require('express');
const morgan = require('morgan');
const AppError = require('./error/appError');
const { errorHandler } = require('./error/error');
const tourRouter = require('./routers/tourRouter');
const userRouter = require('./routers/userRouter');
const { HTTP_404_NOT_FOUND, DEV } = require('./utils/constant');

const app = express();

// MIDDLEWARES
if (process.env.NODE_ENV.trim() === DEV) {
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
  //calling next() with err as param will skip all other middlewares and forward straight to the error handling middleware.
  next(new AppError(`Cannot find ${req.originalUrl}`, HTTP_404_NOT_FOUND));
});

//Global error handling middlware
app.use(errorHandler);

module.exports = app;
