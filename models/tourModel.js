const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

//Create Mongoose Schema
const simpleTourSchema = new mongoose.Schema({
  name: String,
  rating: Number,
  price: Number,
});

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a unique name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have at most 40 characters'],
      minlength: [10, 'A tour name must have at least 10 characters'],
      // validate: [validator.isAlpha, 'A tour name must only contain characters'],
      // validate: {
      //   validator: validator.isAlpha,
      //   message: 'A tour name must only contain characters',
      // },
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Minimum Rating is 1'],
      max: [5, 'Maximum Rating is 5'],
      set: val => Math.round(val * 10) / 10, //4.666667 -> 46.66667 -> 47 -> 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (input) {
          //"this" only refers to current document on NEW document creation
          return input < this.price;
        },
        //{VALUE} refers to the input value
        message: 'priceDiscount ({VALUE}) should not be greater than price',
      },
    },
    summary: {
      type: String,
      required: [true, 'A tour must have a summary'],
      trim: true, //remove all the whitespace at the beginning and end.
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      //automatically created timestamp
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    slug: String,
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number], //Longitude - Latitude
      address: String,
      description: String,
    },
    locations: [
      {
        //embedded documents must be encapsulated in an array
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number, //start day of the tour at location
      },
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  },
  {
    toJSON: { virtuals: true /*versionKey: false*/ },
    toObject: { virtuals: true /*versionKey: false*/ },
  },
);

//single index
// tourSchema.index({ price: 1 }); //1 means ascending order

//compound index
tourSchema.index({ price: 1, ratingsAverage: -1 }); //-1 means decending order
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//Virtual Populating
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

//DOCUMENT middleware
//save only works for .save() and .create() operation. It won't work with insertMany
tourSchema.pre('save', function (next) {
  //create slug before saving the document
  //"this" refer to the to-be-saved document
  this.slug = slugify(this.name, { lower: true });
  console.log(`slug created: ${this.slug}`);
  next();
});

tourSchema.pre('save', function (next) {
  console.log('This is another pre-document-middleware');
  next();
});

tourSchema.post('save', function (doc, next) {
  console.log(`Doc saved successfully with id = ${doc._id}`);
  next();
});

//QUERY Middleware
// tourSchema.pre('find', function (next) {
tourSchema.pre(/^find/, function (next) {
  //this refers to query
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

//populate guides' info
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt -emailConfirm',
  });
  next();
});

// tourSchema.post(/^find/, function (docs, next) {
//   console.log(`Query took: ${Date.now() - this.start}ms`);
//   next();
// });

//AGGREGATION Middleware
tourSchema.pre('aggregate', function (next) {
  const firstStage = this.pipeline()[0];

  //only add this unshift stage if 1st stage is not $geoNear
  //otherwise, ignore this $match
  if (!firstStage['$geoNear']) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  }
  next();
});
const TourModel = new mongoose.model('Tour', tourSchema); //convention: to name mongoose model with first capital letter

module.exports = TourModel;
