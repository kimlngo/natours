const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');
const { ENV, PROD } = require('./constant');

module.exports = class Email {
  constructor(user, url) {
    this.from = ENV.ADMIN_EMAIL;
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
  }

  createNewTransport() {
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

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Reset Your Password (Valid for 10 minutes)',
    );
  }

  async sendConfirmEmail() {
    await this.send(
      'accountConfirmation',
      'Confirm your email (Valid for 10 minutes)',
    );
  }
};
