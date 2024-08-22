const fs = require('fs');

const HTTP_OK = 200;
const HTTP_CREATED = 201;
const HTTP_NO_CONTENT = 204;
const HTTP_NOT_FOUND = 404;
const SUCCESS = 'success';
const FAIL = 'fail';

const FILE_DB = `${__dirname}/../dev-data/data/tours-simple.json`;

const tours = JSON.parse(fs.readFileSync(FILE_DB, 'utf-8'));

function findTourById(tours, id) {
  return tours.find(t => t.id === id);
}

exports.validateTourId = (req, res, next, val) => {
  console.log(`Validate Tour ID. ID = ${val}`);
  const tour = findTourById(tours, Number(val));

  if (!tour) {
    return res.status(HTTP_NOT_FOUND).json({
      status: FAIL,
      message: `Invalid id = ${val}`,
    });
  }

  next();
};

exports.getAllTours = (req, res) => {
  //return all tours
  res.status(HTTP_OK).json({
    status: SUCCESS,
    requestedAt: req.timeStamp,
    results: tours.length,
    data: {
      tours,
    },
  });
};

exports.getTourById = (req, res) => {
  const tour = findTourById(tours, Number(req.params.id));
  res.status(HTTP_OK).json({
    status: SUCCESS,
    data: {
      tour,
    },
  });
};

exports.createNewTour = (req, res) => {
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

exports.updateTour = (req, res) => {
  const tour = findTourById(tours, Number(req.params.id));

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

exports.deleteTourById = (req, res) => {
  const deleteIndex = tours.findIndex(t => t.id === Number(req.params.id));

  tours.splice(deleteIndex, 1);

  //save the whole tour into the file-base DB
  fs.writeFile(FILE_DB, JSON.stringify(tours), () => {
    res.status(HTTP_NO_CONTENT).json({
      status: SUCCESS,
      data: null,
    });
  });
};
