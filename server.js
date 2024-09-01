const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

//Handle Uncaught Exception
process.on('uncaughtException', err => {
  console.log('UNHANDLED EXCEPTION!!! 💥');
  console.log(`Error: ${err}`);
  process.exit(1);
});

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

const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
  console.log(`App is up and running on port ${PORT}...`);
});

//Handle un-handled rejected promises
process.on('unhandledRejection', err => {
  console.log('UNHANDLED EXCEPTION!!! 💥');
  console.log(`Error Name: ${err.name} - Error Message: ${err.message}`);

  //close the server gracefully
  server.close(() => {
    process.exit(1); //eventually kill the process
  });
});
