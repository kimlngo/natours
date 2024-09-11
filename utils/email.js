const nodemailer = require('nodemailer');
const { ENV } = require('./constant');

const ADMIN_EMAIL = 'admin <admin@gmail.com>';

exports.sendEmail = async function (options) {
  //1) Create a transporter.
  const transporter = nodemailer.createTransport({
    host: ENV.EMAIL_HOST,
    port: ENV.EMAIL_PORT,
    auth: {
      user: ENV.EMAIL_USERNAME,
      pass: ENV.EMAIL_PASSWORD,
    },
  });

  //2) Define the email options
  const mailOptions = {
    from: ADMIN_EMAIL,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  //3) Actually send the email with nodemailer
  await transporter.sendMail(mailOptions);
};
