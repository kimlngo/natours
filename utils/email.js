const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');
const { ENV, PROD } = require('./constant');

const ADMIN_EMAIL = `Kim Long Ngo<${ENV.EMAIL_FROM}>`;

module.exports = class Email {
  constructor(user, url) {
    this.from = ADMIN_EMAIL;
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
  }

  createNewTransport() {
    if (ENV.NODE_ENV.trim() === PROD) {
      //sendgrid
      return 1;
    }
    return nodemailer.createTransport({
      host: ENV.EMAIL_HOST,
      port: ENV.EMAIL_PORT,
      auth: {
        user: ENV.EMAIL_USERNAME,
        pass: ENV.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    //send the actual email
    //1) Render HTML based on a pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      },
    );

    //2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };
    //3) Create a transport and send email
    await this.createNewTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }
};

// exports.sendConfirmEmail = async function (req, confirmToken) {
//   const options = prepareConfirmEmail(req, confirmToken);

//   return sendEmail(options);
// };

// exports.sendResetPasswordEmail = async function (req, resetToken) {
//   const options = prepareResetPasswordEmail(req, resetToken);
//   return sendEmail(options);
// };
// async function sendEmail(options) {
//   //1) Create a transporter.
//   const transporter = nodemailer.createTransport({
//     host: ENV.EMAIL_HOST,
//     port: ENV.EMAIL_PORT,
//     auth: {
//       user: ENV.EMAIL_USERNAME,
//       pass: ENV.EMAIL_PASSWORD,
//     },
//   });

//   //2) Define the email options
//   const mailOptions = {
//     from: ADMIN_EMAIL,
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//   };

//   //3) Actually send the email with nodemailer
//   await transporter.sendMail(mailOptions);
// }

// function prepareResetPasswordEmail(req, resetToken) {
//   const email = req.body.email;
//   const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

//   const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}\nIf you didn't forget your password, please ignore this email`;

//   return {
//     email,
//     subject: 'Reset Your Password (Valid for 10 minutes)',
//     message,
//   };
// }

// function prepareConfirmEmail(req, confirmToken) {
//   const email = req.body.email;
//   const confirmURL = `${req.protocol}://${req.get('host')}/api/v1/users/confirmEmail/${confirmToken}`;

//   const message = `Confirm your email by submitting a POST request to\n${confirmURL}\n\nIf you did not sign up, please ignore this email`;

//   return {
//     email,
//     subject: 'Confirm your email (Valid for 10 minutes)',
//     message,
//   };
// }
