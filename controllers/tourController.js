const TourModel = require('./../models/tourModel');
const { catchAsync } = require('./../error/error');
const { HTTP_200_OK, SUCCESS } = require('./../utils/constant');
const handlerFactory = require('./handlerFactory');

exports.aliasBestFiveTours = function (req, res, next) {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,duration,difficulty,ratingsAverage,summary';

  next();
};

exports.getAllTours = handlerFactory.getAll(TourModel);

exports.getTourById = handlerFactory.getOne(TourModel, {
  path: 'reviews',
  select: '-__v',
});

exports.createNewTour = handlerFactory.createOne(TourModel);

exports.updateTour = handlerFactory.updateOne(TourModel);

exports.deleteTourByIds = handlerFactory.deleteByIds(TourModel);

exports.getTourStats = catchAsync(async function (req, res, next) {
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
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);

  res.status(HTTP_200_OK).json({
    status: SUCCESS,
    data: {
      stats,
    },
  });
  // res.status(HTTP_NOT_FOUND).json({
  //   status: FAIL,
  //   message: err.message,
});

exports.getMonthlyPlan = catchAsync(async function (req, res, next) {
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

  res.status(HTTP_200_OK).json({
    status: SUCCESS,
    results: plans.length,
    data: {
      plans,
    },
  });
  // res.status(HTTP_NOT_FOUND).json({
  //   status: FAIL,
  //   message: err.message,
});
