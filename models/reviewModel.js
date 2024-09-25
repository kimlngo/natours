// review / rating / createdAt / ref to the tour / ref to author user
const mongoose = require('mongoose');
const TourModel = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
    },
    rating: {
      type: Number,
      min: [1, 'Minimum Rating is 1'],
      max: [5, 'Maximum Rating is 5'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must be written by a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.pre(/^find/, function (next) {
  //disable populating tour details in review
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // })
  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  //this is static method, the "this" keyword refers to the Model
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        ratingQuantity: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    //saving avgRating into tour
    await TourModel.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].ratingQuantity,
    });
  } else {
    await TourModel.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5, //default ratingsAverage
      ratingsQuantity: 0,
    });
  }
};

reviewSchema.post('save', function () {
  //instance method, "this" points to current document
  this.constructor.calcAverageRatings(this.tour);
});

//findByIdAndUpdate
//findbyIdAndDelete

reviewSchema.pre(/^findOneAnd/, async function (next) {
  //this is pointing to the query
  this.r = await this.clone().findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  //how to get the tour id to run the calcAverageRatings
  if (this.r) await this.r.constructor.calcAverageRatings(this.r.tour);
});
const ReviewModel = new mongoose.model('Review', reviewSchema);

module.exports = ReviewModel;
