const express = require('express');
const bookingCtrl = require('../controllers/bookingController');
const authCtrl = require('../controllers/authController');
const { ADMIN, USER } = require('../utils/constant');
const router = express.Router();

router.get(
  '/checkout-session/:tourId',
  authCtrl.protect,
  bookingCtrl.getCheckoutSession,
);

router.get(
  '/',
  authCtrl.protect,
  authCtrl.restrictTo(ADMIN),
  bookingCtrl.getAllBookings,
);

router.get(
  '/:id',
  authCtrl.protect,
  authCtrl.restrictTo(ADMIN, USER),
  bookingCtrl.getOneBooking,
);
module.exports = router;
