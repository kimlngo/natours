const handlerFactory = require('./handlerFactory');
const ReviewModel = require('./../models/reviewModel');

exports.getAllReviews = handlerFactory.getAll(ReviewModel);
exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }
  if (!req.body.user) {
    req.body.user = req.user.id; //obtained from authCtrl.protect
  }
  next();
};

exports.createReview = handlerFactory.createOne(ReviewModel);
exports.updateReviews = handlerFactory.updateOne(ReviewModel);
exports.deleteReviews = handlerFactory.deleteByIds(ReviewModel);
exports.getReview = handlerFactory.getOne(ReviewModel);
