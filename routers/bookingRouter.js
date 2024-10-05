const express = require('express');
const bookingCtrl = require('../controllers/bookingController');
const authCtrl = require('../controllers/authController');
const { ADMIN, LEAD_GUIDE } = require('../utils/constant');
const router = express.Router();

router.use(authCtrl.protect);

router.get(
  '/checkout-session/:tourId',
  authCtrl.protect,
  bookingCtrl.getCheckoutSession,
);

router.use(authCtrl.restrictTo(ADMIN, LEAD_GUIDE));

router
  .route('/')
  .get(bookingCtrl.getAllBookings)
  .post(bookingCtrl.createBooking);

router
  .route('/:id')
  .get(bookingCtrl.getOneBooking)
  .patch(bookingCtrl.updateBooking)
  .delete(bookingCtrl.deleteBooking);
module.exports = router;
