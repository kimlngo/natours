const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routers/tourRouter');
const userRouter = require('./routers/userRouter');
const { HTTP_NOT_FOUND, FAIL } = require('./utils/constant');

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
  res.status(HTTP_NOT_FOUND).json({
    status: FAIL,
    message: `Cannot find ${req.originalUrl}`,
  });
});

module.exports = app;
