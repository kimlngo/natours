const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require('./app');

// console.log(process.env);
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`App is up and running on port ${PORT}...`);
});
