const express = require('express');
const reviewCtrl = require('../controllers/reviewController');
const authCtrl = require('../controllers/authController');
const router = express.Router({ mergeParams: true });

//all review routes: GET All review, POST new review

//Simple nested routes
//{url}/api/v1/tour/13412aefea/reviews
//mergeParams=true will make tourId visible in req.params
router
  .route('/')
  .get(reviewCtrl.getAllReviews)
  .post(
    authCtrl.protect,
    authCtrl.restrictTo('user'),
    reviewCtrl.createNewReview,
  );

module.exports = router;
