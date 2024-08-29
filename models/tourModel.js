const mongoose = require('mongoose');
const slugify = require('slugify');

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
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: Number,
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
  },
  {
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true, versionKey: false },
  },
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//Document middleware
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
const Tour = new mongoose.model('Tour', tourSchema); //convention: to name mongoose model with first capital letter

module.exports = Tour;
