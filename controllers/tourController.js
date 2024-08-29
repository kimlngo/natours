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

exports.deleteTourByIds = async function (req, res) {
  try {
    const listIds = req.params.id.split(',');
    await TourModel.deleteMany({ _id: { $in: listIds } });

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

exports.getTourStats = async function (req, res) {
  try {
    const stats = await TourModel.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          // _id: '$difficulty',
          count: { $sum: 1 },
          totalRatings: { $sum: '$ratingsAverage' },
          avgRatings: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
      {
        $match: { _id: { $ne: 'EASY' } },
      },
    ]);

    res.status(HTTP_OK).json({
      status: SUCCESS,
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(HTTP_NOT_FOUND).json({
      status: FAIL,
      message: err.message,
    });
  }
};

exports.getMonthlyPlan = async function (req, res) {
  try {
    const year = Number(req.params.year);
    const plans = await TourModel.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $project: {
          month: {
            $dateToString: {
              format: '%B',
              date: '$startDates',
            },
          },
          name: 1,
        },
      },
      {
        $group: {
          // _id: { $month: '$startDates' },
          _id: { $toUpper: '$month' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: { _id: 0 },
      },
      {
        $sort: { numTourStarts: -1 }, //decending order
      },
      {
        $limit: 100,
      },
    ]);

    res.status(HTTP_OK).json({
      status: SUCCESS,
      results: plans.length,
      data: {
        plans,
      },
    });
  } catch (err) {
    res.status(HTTP_NOT_FOUND).json({
      status: FAIL,
      message: err.message,
    });
  }
};
