const express = require('express');
const tourCtrl = require('./../controllers/tourController');
const router = express.Router();

router.route('/').get(tourCtrl.getAllTours).post(tourCtrl.createNewTour);

router
  .route('/:id')
  .get(tourCtrl.getTourById)
  .patch(tourCtrl.updateTour)
  .delete(tourCtrl.deleteTourById);

module.exports = router;
