const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    // Skip sending if email environment variables are not set
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('✉️ Email service not configured (missing host, user, or password). Skipping.');
      return { skipped: true };
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Jyotish App ✨" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: html || `<p>${text}</p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('✉️ Email send failed:', error.message);
    // Return safety object so booking does not crash
    return { error: error.message };
  }
};

module.exports = { sendEmail };
