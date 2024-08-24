const mongoose = require('mongoose');

//Create Mongoose Schema
const simpleTourSchema = new mongoose.Schema({
  name: String,
  rating: Number,
  price: Number,
});

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a unique name'],
    unique: true,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
});

const Tour = new mongoose.model('Tour', tourSchema); //convention: to name mongoose model with first capital letter

module.exports = Tour;
