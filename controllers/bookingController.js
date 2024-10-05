const TourModel = require('./../models/tourModel');
const BookingModel = require('./../models/bookingModel');
const { catchAsync } = require('./../error/error');
const handlerFactory = require('./handlerFactory');
const { ENV, HTTP_200_OK, SUCCESS } = require('./../utils/constant');
const stripe = require('stripe')(ENV.STRIPE_SECRET_KEY);

exports.getCheckoutSession = catchAsync(async function (req, res, next) {
  //1) Get the currently booked tour
  const tourId = req.params.tourId;
  const userId = req.user.id;
  const tour = await TourModel.findById(tourId);

  //2) Create sesion checkout
  const product = await stripe.products.create({
    name: `${tour.name} Tour`,
    description: tour.summary,
    images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: tour.price * 100,
    currency: 'usd',
  });

  const session = await stripe.checkout.sessions.create({
    //info abt session
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${tourId}&user=${userId}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: tourId,
    mode: 'payment',
    //info abt purchased product
    line_items: [
      {
        price: price.id,
        quantity: 1,
      },
    ],
  });

  //3) Create sesion response
  res.status(HTTP_200_OK).json({
    status: SUCCESS,
    session,
  });
});

exports.createBookingCheckout = catchAsync(async function (req, res, next) {
  //This is only Temporary Solution, because it's unsecured: everyone can make booking without paying
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();

  await BookingModel.create({
    tour,
    user,
    price,
  });

  //Redirect to /overview without tour, user and price info
  res.redirect(req.originalUrl.split('?')[0]);
});

exports.getAllBookings = handlerFactory.getAll(BookingModel);
exports.getOneBooking = handlerFactory.getOne(BookingModel);
