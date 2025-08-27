// backend/utils/sendEmail.js
const nodemailer = require('nodemailer');

/**
 * Sends an email using Nodemailer
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - Email HTML content
 */
const sendEmail = async (to, subject, html) => {
  try {
    // Create a transporter (Gmail, SMTP, etc.)
    const transporter = nodemailer.createTransport({
      service: 'gmail', // you can change to 'outlook', 'yahoo', or use SMTP
      auth: {
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASS, // app password or smtp password
      },
    });

    // Email options
    const mailOptions = {
      from: `"Second Chance Store" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new Error("Email could not be sent");
  }
};

module.exports = sendEmail;
