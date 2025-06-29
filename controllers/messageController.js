const Message = require('../models/Message');
const User = require('../models/User');
const { sequelize } = require('../config/database');

// Test database connections
exports.testDb = async (req, res) => {
    try {
        console.log('🔍 Testing database connections...');
        
        // Test MySQL connection
        await sequelize.authenticate();
        console.log('✅ MySQL connection successful');
        
        // Get table information
        const tables = await sequelize.showAllSchemas();
        console.log('✅ MySQL tables:', tables);
        
        res.json({
            success: true,
            message: 'Database connected successfully',
            database: 'MySQL',
            status: 'connected'
        });
    } catch (error) {
        console.error('Test DB error:', error);
        res.status(500).json({
            success: false,
            message: 'Database test failed',
            error: error.message
        });
    }
};

// Get all messages
exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.findAll({
            order: [['createdAt', 'DESC']]
        });
        
        res.json({
            success: true,
            data: messages
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get messages',
            error: error.message
        });
    }
};

// Create a new message
exports.createMessage = async (req, res) => {
    try {
        const { content, senderId, receiverId, room } = req.body;
        
        if (!content || !senderId || !receiverId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: content, senderId, receiverId'
            });
        }

        const message = await Message.create({
            content,
            senderId,
            receiverId,
            room: room || 'global'
        });
        
        res.status(201).json({
            success: true,
            data: message
        });
    } catch (error) {
        console.error('Create message error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create message',
            error: error.message
        });
    }
};