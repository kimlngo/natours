const fs = require('fs');
const mongoose = require('mongoose');
const TourModel = require('./../../models/tourModel');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const DB_CONNECTION = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

const FILE_PATH = './dev-data/data/tours-simple.json';
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
    const toursArr = JSON.parse(await readDataFile());
    const trimTours = [];
    //Strip the temp id of data
    toursArr.forEach(t => {
      const { id, ...remain } = t;
      trimTours.push(remain);
    });

    //mutliple document creation when passing a list of objects
    await TourModel.create(trimTours);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
};

const deleteData = async function () {
  try {
    await TourModel.deleteMany();
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
};

const readDataFile = async function () {
  return new Promise((resolve, reject) => {
    fs.readFile(FILE_PATH, UTF8, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
};
