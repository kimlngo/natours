const fs = require('fs');
const express = require('express');

const app = express();

//middleware
app.use(express.json());

//Constants
const PORT = 3000;
const HTTP_OK = 200;
const HTTP_CREATED = 201;
const HTTP_NO_CONTENT = 204;
const HTTP_NOT_FOUND = 404;
const SUCCESS = 'success';
const FAIL = 'fail';

const FILE_DB = `${__dirname}/dev-data/data/tours-simple.json`;

//Util functions
function findTourById(tours, id) {
  return tours.find(t => t.id === id);
}

//defining routes
//GET route
// app.get('/', (req, res) => {
//   // res.status(200).send('Hello from the server side!');
//   res
//     .status(200)
//     .json({ message: 'Hello from the server side!', app: 'Natours' });
// });

// //POST route
// app.post('/', (req, res) => {
//   res.send('You can post to this endpoint...');
// });
const tours = JSON.parse(fs.readFileSync(FILE_DB, 'utf-8'));

// let tours;

// fs.readFile(
//   `${__dirname}/dev-data/data/tours-simple.json`,
//   'utf-8',
//   (err, data) => {
//     tours = JSON.parse(data);
//   }
// );

//GET All Tours Implementation
app.get('/api/v1/tours', (req, res) => {
  //return all tours
  res.status(HTTP_OK).json({
    status: SUCCESS,
    results: tours.length,
    data: {
      tours, //ES6 format, don't need to specify key if they're the same.
    },
  });
});

//GET tour by id
app.get('/api/v1/tours/:id', (req, res) => {
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
});

//POST - Create a new tour
app.post('/api/v1/tours', (req, res) => {
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
});

//PATCH Update Implementation
app.patch('/api/v1/tours/:id', (req, res) => {
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
});

//DELETE Implementation
app.delete('/api/v1/tours/:id', (req, res) => {
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
});

//starting up server
app.listen(PORT, () => {
  console.log(`App is up and running on port ${PORT}...`);
});
