const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

exports.register = async (req, res) => {
    const { email, username, password } = req.body;
    
    // Validate required fields
    if (!email || !username || !password) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields: email, username, password'
        });
    }
    
    try {
        // Check MySQL connection
        if (!sequelize.authenticate) {
            return res.status(503).json({
                success: false,
                error: 'Database not connected'
            });
        }

        const exists = await User.findOne({
            where: {
                [Op.or]: [{ email }, { username }]
            }
        });
        if (exists) {
            console.log('⚠️ Registration attempt with existing email or username:', email, username);
            return res.status(400).json({ 
                success: false,
                error: 'User already exists' 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ email, username, password: hashedPassword });

        const token = jwt.sign(
            { id: user.id, email: user.email, username: user.username },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '1h' }
        );

        console.log('✅ New user registered:', email);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: { email, username },
            token
        });
    } catch (err) {
        console.error('❌ Registration error:', err.message);
        res.status(500).json({ 
            success: false,
            error: 'Registration failed',
            details: err.message 
        });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields: email, password'
        });
    }
    
    try {
        // Check MySQL connection
        if (!sequelize.authenticate) {
            return res.status(503).json({
                success: false,
                error: 'Database not connected'
            });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.log('⚠️ Login failed for email:', email);
            return res.status(400).json({ 
                success: false,
                error: 'Invalid email or password' 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('⚠️ Login failed (wrong password) for email:', email);
            return res.status(400).json({ 
                success: false,
                error: 'Invalid email or password' 
            });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, username: user.username },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '1h' }
        );

        console.log('✅ User logged in:', email);

        res.json({
            success: true,
            message: 'Login successful',
            user: { email: user.email, username: user.username },
            token
        });
    } catch (err) {
        console.error('❌ Login error:', err.message);
        res.status(500).json({ 
            success: false,
            error: 'Login failed',
            details: err.message 
        });
    }
};