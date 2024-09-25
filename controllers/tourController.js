const TourModel = require('./../models/tourModel');
const { catchAsync } = require('./../error/error');
const {
  SUCCESS,
  HTTP_200_OK,
  HTTP_400_BAD_REQUEST,
  MI,
  MI_DIVISOR,
  KM_DIVISOR,
  KM,
  M_TO_MI,
  M_TO_KM,
} = require('./../utils/constant');
const handlerFactory = require('./handlerFactory');
const AppError = require('./../error/appError');

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

//tours-within/:distance/center/:latlgn/unit/:unit
//tours-within/240/center/34.11,-118.11/unit/mi
exports.getToursWithin = catchAsync(async function (req, res, next) {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  validateLocationParams(req, next);

  const radius = unit === MI ? distance / MI_DIVISOR : distance / KM_DIVISOR;

  const tours = await TourModel.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius],
      },
    },
  });

  res.status(HTTP_200_OK).json({
    status: SUCCESS,
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async function (req, res, next) {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  validateLocationParams(req, next);

  const multiplier = unit === MI ? M_TO_MI : M_TO_KM;
  const distances = await TourModel.aggregate([
    {
      //geoNear must be the first stage of aggregate
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [Number(lng), Number(lat)],
        },
        //calculate distance is in meter
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        name: 1,
        distance: 1,
      },
    },
  ]);

  res.status(HTTP_200_OK).json({
    status: SUCCESS,
    data: {
      data: distances,
    },
  });
});

function validateLocationParams(req, next) {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitude and longitude in the format of lat,lgn.',
        HTTP_400_BAD_REQUEST,
      ),
    );
  } else if (unit !== MI && unit !== KM) {
    return next(
      new AppError(
        'Please provide unit as either mi or km',
        HTTP_400_BAD_REQUEST,
      ),
    );
  }
}
