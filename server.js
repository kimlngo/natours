const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require('./app');

const DB_CONNECTION = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

//REMOTE DATABASE
mongoose.connect(DB_CONNECTION).then(() => {
  console.log('DB Connection Successful');
});

//LOCAL DATABASE
// mongoose.connect(process.env.DATABASE_LOCAL).then(() => {
//   console.log('DB Connection Successful');
// });

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

const testTour = new Tour({
  name: 'St Joseph Oratory',
  rating: 4.9,
  price: 200,
});

testTour
  .save()
  .then(doc => console.log(doc))
  .catch(err => console.error(err));

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`App is up and running on port ${PORT}...`);
});
