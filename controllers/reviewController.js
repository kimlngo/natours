const reviewModel = require('./../models/reviewModel');
const { catchAsync } = require('./../error/error');
const { SUCCESS, HTTP_200_OK, HTTP_201_CREATED } = require('../utils/constant');

exports.getAllReviews = catchAsync(async function (req, res, next) {
  const reviews = await reviewModel.find();

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
