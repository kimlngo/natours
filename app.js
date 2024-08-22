const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routers/tourRouter');
const userRouter = require('./routers/userRouter');

const app = express();

// MIDDLEWARES
if (process.env.NODE_ENV.trim() === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());

// Access static files
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  console.log('Hello from middleware 👋');
  //must call next() to pass execution to the next
  next();
});

//add request timestamp to request object using middleware
app.use((req, res, next) => {
  req.timeStamp = new Date().toISOString();
  next();
});

// ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
