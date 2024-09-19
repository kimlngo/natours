const express = require('express');
const reviewCtrl = require('./../controllers/reviewController');
const authCtrl = require('./../controllers/authController');
const router = express.Router();

//all review routes: GET All review, POST new review

router
  .route('/')
  .get(reviewCtrl.getAllReviews)
  .post(
    authCtrl.protect,
    authCtrl.restrictTo('user'),
    reviewCtrl.createNewReview,
  );

module.exports = router;
