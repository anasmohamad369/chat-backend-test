const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

exports.register = async (req, res) => {
    const { email, username, password } = req.body;
    try {
        const exists = await User.findOne({
            where: {
                [Op.or]: [{ email }, { username }]
            }
        });
        if (exists) {
            console.log('⚠️ Registration attempt with existing email or username:', email, username);
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ email, username, password: hashedPassword });

        const token = jwt.sign(
            { id: user.id, email: user.email, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log('✅ New user registered:', email);

        res.status(201).json({
            message: 'User registered',
            user: { email, username },
            token
        });
    } catch (err) {
        console.error('❌ Registration error:', err.message);
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.log('⚠️ Login failed for email:', email);
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('⚠️ Login failed (wrong password) for email:', email);
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log('✅ User logged in:', email);

        res.json({
            message: 'Login successful',
            user: { email: user.email, username: user.username },
            token
        });
    } catch (err) {
        console.error('❌ Login error:', err.message);
        res.status(500).json({ error: err.message });
    }
};