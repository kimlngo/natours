const TourModel = require('./../models/tourModel');
const { catchAsync } = require('./../error/error');
const { HTTP_200_OK, HTTP_404_NOT_FOUND } = require('./../utils/constant');
const AppError = require('../error/appError');

const OVERVIEW_PUG = 'overview';
const TOUR_PUG = 'tour';
const LOGIN_PUG = 'login';

exports.getOverview = catchAsync(async function (req, res, next) {
  //1) Get tour data from collection
  const tours = await TourModel.find();

  //2) Build template
  //3) Render that template using tour data from (1)
  res.status(HTTP_200_OK).render(OVERVIEW_PUG, {
    title: 'All Tours',
    tours,
  });
});

exports.getTourDetail = catchAsync(async function (req, res, next) {
  //1) Get the data for the requested tour (including reviews and guides)
  const tour = await TourModel.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(
      new AppError('There is no tour with that name', HTTP_404_NOT_FOUND),
    );
  }

  //2) Build Template
  //3) Render Template using data from (1)
  res
    .status(HTTP_200_OK)
    // .set(
    //   'Content-Security-Policy',
    //   "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;",
    // )
    .render(TOUR_PUG, {
      title: `${tour.name} Tour`,
      tour,
    });
});

exports.getLoginForm = function (req, res, next) {
  res.status(HTTP_200_OK).render(LOGIN_PUG, {
    title: 'Log into your account',
  });
};
