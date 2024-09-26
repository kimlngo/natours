const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./error/appError');
const { errorHandler } = require('./error/error');
const tourRouter = require('./routers/tourRouter');
const userRouter = require('./routers/userRouter');
const reviewRouter = require('./routers/reviewRouter');
const {
  HTTP_404_NOT_FOUND,
  DEV,
  ENV,
  HTTP_200_OK,
} = require('./utils/constant');

const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Access static files
app.use(express.static(path.join(__dirname, 'public')));

// GLOBAL MIDDLEWARES
//development logging
if (ENV.NODE_ENV.trim() === DEV) {
  app.use(morgan('dev'));
}
//Set security HTTP Headers
app.use(helmet());

//Limit request from same api
//max 100 req/hr/ip
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again later!',
});

//only applicable to /api
app.use('/api', limiter);

//body parser, reading data from body into req.body
app.use(
  express.json({
    limit: '10kb',
  }),
);

//Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

//Data Sanitization against XSS
app.use(xss());

//Prevent parameter polution with whitelist
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

//test middleware
//add request timestamp to request object using middleware
app.use((req, res, next) => {
  req.timeStamp = new Date().toISOString();
  next();
});

// ROUTES
app.get('/', (req, res) => {
  res.status(HTTP_200_OK).render('base', {
    tour: 'The Forest Hiker',
    user: 'Kim Long Ngo',
  });
});

app.get('/overview', (req, res) => {
  res.status(HTTP_200_OK).render('overview', {
    title: 'All Tours',
  });
});

app.get('/tour', (req, res) => {
  res.status(HTTP_200_OK).render('tour', {
    title: 'The Forest Hiker',
  });
});
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// Default 404 Route
app.all('*', (req, res, next) => {
  //calling next() with err as param will skip all other middlewares and forward straight to the error handling middleware.
  next(new AppError(`Cannot find ${req.originalUrl}`, HTTP_404_NOT_FOUND));
});

//Global error handling middlware
app.use(errorHandler);

module.exports = app;
