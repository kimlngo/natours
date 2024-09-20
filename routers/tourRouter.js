const express = require('express');
const tourCtrl = require('./../controllers/tourController');
const authCtrl = require('./../controllers/authController');
const reviewCtrl = require('./../controllers/reviewController');
const { ADMIN, LEAD_GUIDE } = require('../utils/constant');
const router = express.Router();

// router.param('id', tourCtrl.validateTourId);

//alias for top 5 best tours
router
  .route('/best-five-tours')
  .get(tourCtrl.aliasBestFiveTours, tourCtrl.getAllTours);

router.route('/stats').get(tourCtrl.getTourStats);
router.route('/monthly-plan/:year').get(tourCtrl.getMonthlyPlan);
//prettier-ignore
router
  .route('/')
  .get(authCtrl.protect, tourCtrl.getAllTours)
  .post(tourCtrl.createNewTour);

router
  .route('/:id')
  .get(tourCtrl.getTourById)
  .patch(tourCtrl.updateTour)
  .delete(
    authCtrl.protect,
    authCtrl.restrictTo(ADMIN, LEAD_GUIDE),
    tourCtrl.deleteTourByIds,
  );

//Simple nested routes
//{url}/api/v1/tour/13412aefea/reviews
router
  .route('/:tourId/reviews')
  .post(
    authCtrl.protect,
    authCtrl.restrictTo('user'),
    reviewCtrl.createNewReview,
  );

module.exports = router;
