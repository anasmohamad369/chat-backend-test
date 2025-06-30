const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Check if model already exists
const Message = sequelize.models.Message || sequelize.define('Message', {
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    senderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    receiverId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Allow null for broadcast messages
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    room: {
        type: DataTypes.STRING,
        defaultValue: 'global'
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, { timestamps: true });

module.exports = Message;