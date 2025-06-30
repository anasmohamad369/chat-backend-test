const { User, Message } = require('../models');
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

// Get all messages with user information
exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.findAll({
            include: [
                {
                    model: User,
                    as: 'sender',
                    attributes: ['id', 'username', 'email']
                },
                {
                    model: User,
                    as: 'receiver',
                    attributes: ['id', 'username', 'email']
                }
            ],
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
        const { content, senderUsername, receiverUsername, room } = req.body;
        
        if (!content || !senderUsername) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: content, senderUsername'
            });
        }

        // Find sender user
        const sender = await User.findOne({ where: { username: senderUsername } });
        if (!sender) {
            return res.status(404).json({
                success: false,
                message: 'Sender user not found'
            });
        }

        let receiverId = null;
        if (receiverUsername) {
            // Find receiver user
            const receiver = await User.findOne({ where: { username: receiverUsername } });
            if (!receiver) {
                return res.status(404).json({
                    success: false,
                    message: 'Receiver user not found'
                });
            }
            receiverId = receiver.id;
        }

        const message = await Message.create({
            content,
            senderId: sender.id,
            receiverId,
            room: room || 'global'
        });
        
        // Get the created message with user information
        const messageWithUsers = await Message.findByPk(message.id, {
            include: [
                {
                    model: User,
                    as: 'sender',
                    attributes: ['id', 'username', 'email']
                },
                {
                    model: User,
                    as: 'receiver',
                    attributes: ['id', 'username', 'email']
                }
            ]
        });
        
        res.status(201).json({
            success: true,
            data: messageWithUsers
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