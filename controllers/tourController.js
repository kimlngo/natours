const TourModel = require('./../models/tourModel');
const { catchAsync } = require('./../error/error');
const AppError = require('./../error/appError');
const {
  HTTP_200_OK,
  HTTP_201_CREATED,
  HTTP_204_NO_CONTENT,
  HTTP_404_NOT_FOUND,
  SUCCESS,
} = require('./../utils/constant');

const DataAccessImpl = require('./../data-access/dataAccess');

exports.aliasBestFiveTours = function (req, res, next) {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,duration,difficulty,ratingsAverage,summary';

  next();
};

exports.getAllTours = catchAsync(async function (req, res) {
  const rawQuery = req.query;
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
  res.status(HTTP_200_OK).json({
    status: SUCCESS,
    results: tours.length,
    data: {
      tours,
    },
  });
  // res.status(HTTP_NOT_FOUND).json({
  //   status: FAIL,
  //   message: err.message,
});

exports.getTourById = catchAsync(async function (req, res) {
  const tour = await TourModel.findById(req.params.id);
  // const tour = await Tour.findOne({_id: req.params.id});

  if (!tour)
    throw new AppError(
      `Can't find tour with id ${req.params.id}`,
      HTTP_404_NOT_FOUND,
    );
  res.status(HTTP_200_OK).json({
    status: SUCCESS,
    data: {
      tour,
    },
  });
  // res.status(HTTP_NOT_FOUND).json({
  //   status: FAIL,
  //   message: err.message,
});

exports.createNewTour = catchAsync(async function (req, res, next) {
  const newTour = await TourModel.create(req.body);

  res.status(HTTP_201_CREATED).json({
    status: SUCCESS,
    data: {
      tour: newTour,
    },
  });
});

exports.updateTour = catchAsync(async function (req, res) {
  const updatedTour = await TourModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true, //return new document
      runValidators: true,
    },
  );

  res.status(HTTP_200_OK).json({
    status: SUCCESS,
    data: {
      tour: updatedTour,
    },
  });
  // res.status(HTTP_NOT_FOUND).json({
  //   status: FAIL,
  //   message: err.message,
});

exports.deleteTourByIds = catchAsync(async function (req, res) {
  const listIds = req.params.id.split(',');
  await TourModel.deleteMany({ _id: { $in: listIds } });

  res.status(HTTP_204_NO_CONTENT).json({
    status: SUCCESS,
    data: null,
  });
  // res.status(HTTP_NOT_FOUND).json({
  //   status: FAIL,
  //   message: 'Could not delete tour!',
});

exports.getTourStats = catchAsync(async function (req, res) {
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

exports.getMonthlyPlan = catchAsync(async function (req, res) {
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
