const reviewModel = require('./../models/reviewModel');
const { catchAsync } = require('./../error/error');
const { SUCCESS, HTTP_200_OK, HTTP_201_CREATED } = require('../utils/constant');

const handlerFactory = require('./handlerFactory');
const ReviewModel = require('./../models/reviewModel');

exports.getAllReviews = catchAsync(async function (req, res, next) {
  let filter = {};

  if (req.params.tourId) filter = { tour: req.params.tourId };

  const reviews = await reviewModel.find(filter);

  res.status(HTTP_200_OK).json({
    status: SUCCESS,
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.createNewReview = catchAsync(async function (req, res, next) {
  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }
  if (!req.body.user) {
    req.body.user = req.user.id; //obtained from authCtrl.protect
  }

  const newReview = await reviewModel.create(req.body);

  res.status(HTTP_201_CREATED).json({
    status: SUCCESS,
    data: {
      review: newReview,
    },
  });
});

exports.deleteReviews = handlerFactory.deleteByIds(ReviewModel);
