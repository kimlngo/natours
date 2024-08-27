const express = require('express');
const tourCtrl = require('./../controllers/tourController');
const router = express.Router();

// router.param('id', tourCtrl.validateTourId);

//alias for top 5 best tours
router
  .route('/best-five-tours')
  .get(tourCtrl.aliasBestFiveTours, tourCtrl.getAllTours);

//prettier-ignore
router
  .route('/')
  .get(tourCtrl.getAllTours)
  .post(tourCtrl.createNewTour);

router
  .route('/:id')
  .get(tourCtrl.getTourById)
  .patch(tourCtrl.updateTour)
  .delete(tourCtrl.deleteTourById);

module.exports = router;
