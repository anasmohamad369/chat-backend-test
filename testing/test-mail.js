require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.sendMail({
    to: process.env.EMAIL_USER,
    subject: 'Test Email',
    text: 'This is a test'
}, (err, info) => {
    if (err) {
        console.error('❌ Email error:', err);
    } else {
        console.log('✅ Email sent:', info.response);
    }
});