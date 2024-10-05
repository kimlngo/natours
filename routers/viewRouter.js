const express = require('express');
const viewsCtrl = require('./../controllers/viewsController');
const authCtrl = require('./../controllers/authController');
const bookingCtrl = require('./../controllers/bookingController');
const router = express.Router();

router.get(
  '/',
  bookingCtrl.createBookingCheckout,
  authCtrl.isLoggedIn,
  viewsCtrl.getOverview,
);
router.get('/tour/:slug', authCtrl.isLoggedIn, viewsCtrl.getTourDetail);
router.get('/login', authCtrl.isLoggedIn, viewsCtrl.getLoginForm);
router.get('/me', authCtrl.protect, viewsCtrl.getAccount);

router.post('/submit-user-data', authCtrl.protect, viewsCtrl.updateUserData);
module.exports = router;
