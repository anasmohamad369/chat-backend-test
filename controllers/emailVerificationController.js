const { User } = require('../models');
const crypto = require('crypto');
const transporter = require('../config/mailer');

// Send verification email
exports.sendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required'
            });
        }

        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        if (user.emailVerified) {
            return res.status(400).json({
                success: false,
                error: 'Email already verified'
            });
        }

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Save token to user
        await user.update({
            verificationToken,
            verificationExpires
        });

        // Create verification URL
        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

        // Send email
        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Verify Your Email - Chat App',
                html: `
                    <h1>Welcome to Chat App!</h1>
                    <p>Please verify your email address by clicking the link below:</p>
                    <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                        Verify Email
                    </a>
                    <p>Or copy this link: <a href="${verificationUrl}">${verificationUrl}</a></p>
                    <p>This link will expire in 24 hours.</p>
                    <p>If you didn't create an account, please ignore this email.</p>
                `
            });

            console.log('✅ Verification email sent to:', email);
            
            res.json({
                success: true,
                message: 'Verification email sent successfully'
            });

        } catch (emailError) {
            console.error('❌ Email sending failed:', emailError);
            res.status(500).json({
                success: false,
                error: 'Failed to send verification email',
                details: emailError.message
            });
        }

    } catch (error) {
        console.error('❌ Send verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send verification email',
            details: error.message
        });
    }
};

// Verify email with token
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Verification token is required'
            });
        }

        // Find user with this token
        const user = await User.findOne({
            where: {
                verificationToken: token,
                verificationExpires: {
                    [require('sequelize').Op.gt]: new Date()
                }
            }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                error: 'Invalid or expired verification token'
            });
        }

        // Mark email as verified
        await user.update({
            emailVerified: true,
            verificationToken: null,
            verificationExpires: null
        });

        console.log('✅ Email verified for:', user.email);

        res.json({
            success: true,
            message: 'Email verified successfully',
            user: {
                email: user.email,
                username: user.username,
                emailVerified: true
            }
        });

    } catch (error) {
        console.error('❌ Email verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify email',
            details: error.message
        });
    }
};

// Resend verification email
exports.resendVerification = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required'
            });
        }

        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        if (user.emailVerified) {
            return res.status(400).json({
                success: false,
                error: 'Email already verified'
            });
        }

        // Generate new verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Update user with new token
        await user.update({
            verificationToken,
            verificationExpires
        });

        // Create verification URL
        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

        // Send email
        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Verify Your Email - Chat App (Resent)',
                html: `
                    <h1>Email Verification</h1>
                    <p>Please verify your email address by clicking the link below:</p>
                    <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                        Verify Email
                    </a>
                    <p>Or copy this link: <a href="${verificationUrl}">${verificationUrl}</a></p>
                    <p>This link will expire in 24 hours.</p>
                `
            });

            console.log('✅ Resent verification email to:', email);
            
            res.json({
                success: true,
                message: 'Verification email resent successfully'
            });

        } catch (emailError) {
            console.error('❌ Email sending failed:', emailError);
            res.status(500).json({
                success: false,
                error: 'Failed to send verification email',
                details: emailError.message
            });
        }

    } catch (error) {
        console.error('❌ Resend verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to resend verification email',
            details: error.message
        });
    }
}; 