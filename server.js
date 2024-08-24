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

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`App is up and running on port ${PORT}...`);
});
