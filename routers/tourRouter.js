const express = require('express');
const tourCtrl = require('./../controllers/tourController');
const authCtrl = require('./../controllers/authController');
const reviewRouter = require('./reviewRouter');
const { ADMIN, LEAD_GUIDE, GUIDE } = require('../utils/constant');
const router = express.Router();

// router.param('id', tourCtrl.validateTourId);

//forward the /api/v1/tours/:tourId/reviews to reviewRouter
router.use('/:tourId/reviews', reviewRouter);

//alias for top 5 best tours
router
  .route('/best-five-tours')
  .get(tourCtrl.aliasBestFiveTours, tourCtrl.getAllTours);

router.route('/stats').get(tourCtrl.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authCtrl.protect,
    authCtrl.restrictTo(ADMIN, LEAD_GUIDE, GUIDE),
    tourCtrl.getMonthlyPlan,
  );

router
  .route('/')
  .get(tourCtrl.getAllTours)
  .post(
    authCtrl.protect,
    authCtrl.restrictTo(ADMIN, LEAD_GUIDE),
    tourCtrl.createNewTour,
  );

//tours-within/:distance/center/:latlng/unit/:unit
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourCtrl.getToursWithin);

//distances/34.11,-118.11/unit/mi
router.route('/distances/:latlng/unit/:unit').get(tourCtrl.getDistances);

router
  .route('/:id')
  .get(tourCtrl.getTourById)
  .patch(
    authCtrl.protect,
    authCtrl.restrictTo(ADMIN, LEAD_GUIDE),
    tourCtrl.uploadTourImages,
    tourCtrl.resizeTourImages,
    tourCtrl.updateTour,
  )
  .delete(
    authCtrl.protect,
    authCtrl.restrictTo(ADMIN, LEAD_GUIDE),
    tourCtrl.deleteTourByIds,
  );

module.exports = router;
