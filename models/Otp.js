const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Otp = sequelize.define('Otp', {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    otp: {
        type: DataTypes.STRING,
        allowNull: false
    },
    expiresAt: {
        type: DataTypes.BIGINT,
        allowNull: false
    }
}, { timestamps: false });

module.exports = Otp;