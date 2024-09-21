const fs = require('fs');
const mongoose = require('mongoose');
const TourModel = require('./../../models/tourModel');
const UserModel = require('./../../models/userModel');
const ReviewModel = require('./../../models/reviewModel');
const dotenv = require('dotenv');
const { ENV } = require('../../utils/constant');
dotenv.config({ path: './config.env' });

const DB_CONNECTION = ENV.DATABASE.replace('<PASSWORD>', ENV.DATABASE_PASSWORD);

const tourPath = './dev-data/data/tours.json';
const userPath = './dev-data/data/users.json';
const reviewPath = './dev-data/data/reviews.json';

const UTF8 = 'utf-8';
const IMPORT = '--import';
const DELETE = '--delete';

//REMOTE DATABASE
mongoose.connect(DB_CONNECTION).then(() => {
  console.log('DB Connection Successful');
  console.log(`operation = ${process.argv[2]}`);

  if (process.argv[2] === IMPORT) {
    importData();
  } else if (process.argv[2] === DELETE) {
    deleteData();
  }
});

const importData = async function () {
  try {
    const toursArr = JSON.parse(await readDataFile(tourPath));
    const trimTours = [];
    //Strip the temp id of data
    toursArr.forEach(t => {
      const { id, ...remain } = t;
      trimTours.push(remain);
    });

    const userArr = JSON.parse(await readDataFile(userPath));
    const reviewArr = JSON.parse(await readDataFile(reviewPath));

    //mutliple document creation when passing a list of objects
    await TourModel.create(trimTours);
    await UserModel.create(userArr, { validateBeforeSave: false });
    await ReviewModel.create(reviewArr);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
};

const deleteData = async function () {
  try {
    await TourModel.deleteMany();
    await UserModel.deleteMany();
    await ReviewModel.deleteMany();
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
};

const readDataFile = async function (path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, UTF8, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
};
