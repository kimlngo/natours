const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routers/tourRouter');
const userRouter = require('./routers/userRouter');
const app = express();

// MIDDLEWARES
app.use(morgan('dev'));
app.use(express.json());

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
