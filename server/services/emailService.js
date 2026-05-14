const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendEmail = async ({ to, subject, html, text }) => {
  const mailOptions = {
    from: `"Jyotish App ✨" <${process.env.EMAIL_USER}>`,
    to, subject,
    html: html || `<p>${text}</p>`,
  };
  return transporter.sendMail(mailOptions);
};

module.exports = { sendEmail };
