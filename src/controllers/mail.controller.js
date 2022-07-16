const config = require('../config');
const nodemailer = require('nodemailer');
const transpoter = nodemailer.createTransport(config.SMTP);
transpoter.verify().then(() => {
  console.log('listo para el envio de Emails');
});

module.exports = { transpoter };
