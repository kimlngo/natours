const fs = require('fs');
const express = require('express');
const morgan = require('morgan');
const app = express();

//0) Constants
const PORT = 3000;
const HTTP_OK = 200;
const HTTP_CREATED = 201;
const HTTP_NO_CONTENT = 204;
const HTTP_NOT_FOUND = 404;
const HTTP_INTERNAL_ERROR = 500;
const SUCCESS = 'success';
const FAIL = 'fail';

const FILE_DB = `${__dirname}/dev-data/data/tours-simple.json`;

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
const tours = JSON.parse(fs.readFileSync(FILE_DB, 'utf-8'));

//3) ALL HANDLERS
const getAllTours = (req, res) => {
  //return all tours
  res.status(HTTP_OK).json({
    status: SUCCESS,
    requestedAt: req.timeStamp,
    results: tours.length,
    data: {
      tours, //ES6 format, don't need to specify key if they're the same.
    },
  });
};

const getTourById = (req, res) => {
  const tour = findTourById(tours, Number(req.params.id));

  if (!tour) {
    return res.status(HTTP_NOT_FOUND).json({
      status: FAIL,
    });
  }

  res.status(HTTP_OK).json({
    status: SUCCESS,
    data: {
      tour,
    },
  });
};

const createNewTour = (req, res) => {
  //console.log(req.body); //req.body available due to middleware

  const newId = tours.at(-1).id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  //write back to the file
  fs.writeFile(FILE_DB, JSON.stringify(tours), () => {
    res.status(HTTP_CREATED).json({
      status: SUCCESS,
      data: {
        tour: newTour,
      },
    });
  });
};

const updateTour = (req, res) => {
  const id = Number(req.params.id);
  const tour = findTourById(tours, id);

  if (!tour) {
    return res.status(HTTP_NOT_FOUND).json({
      status: FAIL,
    });
  }

  Object.entries(req.body).forEach(entry => {
    tour[entry[0]] = entry[1];
  });

  //save the whole tour into the file-base DB
  fs.writeFile(FILE_DB, JSON.stringify(tours), () => {
    res.status(HTTP_OK).json({
      status: SUCCESS,
      data: {
        tour,
      },
    });
  });
};

const deleteTourById = (req, res) => {
  const deleteIndex = tours.findIndex(t => t.id === Number(req.params.id));
  if (deleteIndex === -1) {
    return res.status(HTTP_NOT_FOUND).json({
      status: FAIL,
    });
  }

  tours.splice(deleteIndex, 1);

  //save the whole tour into the file-base DB
  fs.writeFile(FILE_DB, JSON.stringify(tours), () => {
    res.status(HTTP_NO_CONTENT).json({
      status: SUCCESS,
      data: null,
    });
  });
};

const getAllUsers = (req, res) => {
  res.status(HTTP_INTERNAL_ERROR).json({
    status: 'error',
    message: 'This route is not yet implemented',
  });
};

const createNewUser = (req, res) => {
  res.status(HTTP_INTERNAL_ERROR).json({
    status: 'error',
    message: 'This route is not yet implemented',
  });
};

const getUserById = (req, res) => {
  res.status(HTTP_INTERNAL_ERROR).json({
    status: 'error',
    message: 'This route is not yet implemented',
  });
};
const updateUser = (req, res) => {
  res.status(HTTP_INTERNAL_ERROR).json({
    status: 'error',
    message: 'This route is not yet implemented',
  });
};

const deleteUserById = (req, res) => {
  res.status(HTTP_INTERNAL_ERROR).json({
    status: 'error',
    message: 'This route is not yet implemented',
  });
};
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
const tourRouter = express.Router();
const userRouter = express.Router();

tourRouter.route('/').get(getAllTours).post(createNewTour);

tourRouter
  .route('/:id')
  .get(getTourById)
  .patch(updateTour)
  .delete(deleteTourById);

userRouter.route('/').get(getAllUsers).post(createNewUser);

userRouter
  .route('/:id')
  .get(getUserById)
  .patch(updateUser)
  .delete(deleteUserById);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//starting up server
app.listen(PORT, () => {
  console.log(`App is up and running on port ${PORT}...`);
});

//5) UTIL
function findTourById(tours, id) {
  return tours.find(t => t.id === id);
}
