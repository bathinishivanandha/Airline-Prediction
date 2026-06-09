const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

console.log('Using Email User:', process.env.EMAIL_USER);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const mailOptions = {
  from: `"Test Support" <${process.env.EMAIL_USER}>`,
  to: 'vaishnavipulluri97@gmail.com',
  subject: 'Test OTP - AeroPredict',
  text: 'Your test OTP is 123456'
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('Email Send Error:', error);
  } else {
    console.log('Email sent successfully:', info.response);
  }
});
