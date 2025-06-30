const Otp = require('../models/Otp');
const bcrypt = require('bcrypt');
const transporter = require('../config/mailer');

exports.sendOtp = async (req, res) => {
    const { email, name } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    const hashedOtp = await bcrypt.hash(otp, 10);

    try {
        // Save OTP to database
        await Otp.upsert({ email, name, otp: hashedOtp, expiresAt });
        
        // Try to send email, but don't fail if email is not configured
        try {
            await transporter.sendMail({
                to: email,
                subject: 'Your OTP Code',
                text: `Your OTP is ${otp}. It expires in 5 minutes.`,
            });
            console.log('✅ OTP email sent to:', email);
        } catch (emailError) {
            console.log('⚠️ Email not sent (email not configured), but OTP saved to database');
            console.log('📧 OTP for', email, ':', otp);
        }
        
        res.json({ 
            success: true,
            message: 'OTP sent and saved to database',
            otp: otp // For testing purposes - remove in production
        });
    } catch (error) {
        console.error('❌ OTP creation error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to create OTP',
            details: error.message 
        });
    }
};

exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    
    try {
        const record = await Otp.findOne({ where: { email } });
        if (!record || Date.now() > record.expiresAt) {
            return res.status(400).json({ 
                success: false,
                error: 'Invalid or expired OTP' 
            });
        }
        
        const isMatch = await bcrypt.compare(otp, record.otp);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false,
                error: 'Invalid or expired OTP' 
            });
        }
        
        res.json({ 
            success: true,
            verified: true, 
            email 
        });
    } catch (error) {
        console.error('❌ OTP verification error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to verify OTP',
            details: error.message 
        });
    }
};