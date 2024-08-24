const Tour = require('./../models/tourModel');

const HTTP_OK = 200;
const HTTP_CREATED = 201;
const HTTP_NO_CONTENT = 204;
const HTTP_BAD_REQUEST = 400;
const HTTP_NOT_FOUND = 404;
const SUCCESS = 'success';
const FAIL = 'fail';

exports.getAllTours = (req, res) => {};

exports.getTourById = (req, res) => {};

exports.createNewTour = async function (req, res) {
  try {
    const newTour = await Tour.create(req.body);

    res.status(HTTP_CREATED).json({
      status: SUCCESS,
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(HTTP_BAD_REQUEST).json({
      status: FAIL,
      message: 'Invalid data sent!',
    });
  }
};

exports.updateTour = (req, res) => {};

exports.deleteTourById = (req, res) => {};
