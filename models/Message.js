const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Check if model already exists
const Message = sequelize.models.Message || sequelize.define('Message', {
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    senderId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    receiverId: {
        type: DataTypes.STRING,
        allowNull: false
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