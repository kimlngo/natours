const TourModel = require('./../models/tourModel');
const UserModel = require('./../models/userModel');
const BookingModel = require('./../models/bookingModel');
const { catchAsync } = require('./../error/error');
const { HTTP_200_OK, HTTP_404_NOT_FOUND } = require('./../utils/constant');
const AppError = require('../error/appError');

const OVERVIEW_PUG = 'overview';
const TOUR_PUG = 'tour';
const LOGIN_PUG = 'login';
const ACCOUNT_PUG = 'account';

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

exports.getAccount = function (req, res, next) {
  res.status(HTTP_200_OK).render(ACCOUNT_PUG, {
    title: 'Account Overview',
  });
};

exports.getMyTours = catchAsync(async function (req, res, next) {
  //1) Find all bookings with currently logged user id
  const bookings = await BookingModel.find({ user: req.user.id });

  //2) Find tours with the returned IDs
  const tourIds = bookings.map(booking => booking.tour);
  const tours = await TourModel.find({
    _id: { $in: tourIds },
  });

  res.status(HTTP_200_OK).render(OVERVIEW_PUG, {
    title: 'My Tours',
    tours,
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await UserModel.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(HTTP_200_OK).render(ACCOUNT_PUG, {
    title: 'Account Overview',
    user: updatedUser,
  });
});
