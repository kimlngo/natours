const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routers/tourRouter');
const userRouter = require('./routers/userRouter');
const app = express();

//0) Constants

//1) MIDDLEWARES
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

//2) POPULATE TOURS FROM FILE-BASE

//3) ALL HANDLERS

/* OLD CODE
//GET All Tours Implementation
app.get('/api/v1/tours', getAllTours);

//GET tour by id
app.get('/api/v1/tours/:id', getTourById);

//POST - Create a new tour
app.post('/api/v1/tours', createNewTour);

//PATCH Update Implementation
app.patch('/api/v1/tours/:id', updateTour);

//DELETE Implementation
app.delete('/api/v1/tours/:id', deleteTourById);
*/

//4) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
