const TourModel = require('./../models/tourModel');
const {
  HTTP_OK,
  HTTP_CREATED,
  HTTP_NO_CONTENT,
  HTTP_BAD_REQUEST,
  HTTP_NOT_FOUND,
  SUCCESS,
  FAIL,
} = require('./../utils/constant');

const DataAccessImpl = require('./../data-access/dataAccess');

exports.aliasBestFiveTours = function (req, res, next) {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,duration,difficulty,ratingsAverage,summary';

  next();
};

exports.getAllTours = async function (req, res) {
  try {
    const rawQuery = req.query;
    console.log('rawQuery:', rawQuery);
    const dataAccessImpl = new DataAccessImpl(TourModel.find(), rawQuery);

    //query preparation
    //prettier-ignore
    dataAccessImpl.filter()
                  .sort()
                  .project()
                  .paginate();

    //EXECUTE query
    const tours = await dataAccessImpl.query;

    //SEND Response
    res.status(HTTP_OK).json({
      status: SUCCESS,
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(HTTP_NOT_FOUND).json({
      status: FAIL,
      message: err.message,
    });
  }
};

exports.getTourById = async function (req, res) {
  try {
    const tour = await TourModel.findById(req.params.id);
    // const tour = await Tour.findOne({_id: req.params.id});

    if (!tour) throw new Error('Tour NOT FOUND');
    res.status(HTTP_OK).json({
      status: SUCCESS,
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(HTTP_NOT_FOUND).json({
      status: FAIL,
      message: 'Could not load the tours!',
    });
  }
};

exports.createNewTour = async function (req, res) {
  try {
    const newTour = await TourModel.create(req.body);

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

exports.updateTour = async function (req, res) {
  try {
    const tour = await TourModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true, //return new document
      runValidators: true,
    });

    res.status(HTTP_OK).json({
      status: SUCCESS,
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(HTTP_NOT_FOUND).json({
      status: FAIL,
      message: 'Could not update tour!',
    });
  }
};

exports.deleteTourById = async function (req, res) {
  try {
    await TourModel.findByIdAndDelete(req.params.id);

    res.status(HTTP_NO_CONTENT).json({
      status: SUCCESS,
      data: null,
    });
  } catch (err) {
    res.status(HTTP_NOT_FOUND).json({
      status: FAIL,
      message: 'Could not delete tour!',
    });
  }
};
