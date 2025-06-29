const Otp = require('../models/Otp');
const bcrypt = require('bcrypt');
const transporter = require('../config/mailer');

exports.sendOtp = async (req, res) => {
    const { email, name } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    const hashedOtp = await bcrypt.hash(otp, 10);

    try {
        await Otp.upsert({ email, name, otp: hashedOtp, expiresAt });
        await transporter.sendMail({
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP is ${otp}. It expires in 5 minutes.`,
        });
        res.json({ message: 'OTP sent' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send OTP' });
    }
};

exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    const record = await Otp.findOne({ where: { email } });
    if (!record || Date.now() > record.expiresAt) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
    }
    const isMatch = await bcrypt.compare(otp, record.otp);
    if (!isMatch) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
    }
    res.json({ verified: true, email });
};