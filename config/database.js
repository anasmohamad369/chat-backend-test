require('dotenv').config();
const { Sequelize } = require('sequelize');
const mongoose = require('mongoose');

// MySQL (Sequelize) connection
const sequelize = new Sequelize(
    process.env.MYSQL_DB,
    process.env.MYSQL_USER,
    process.env.MYSQL_PASSWORD,
    {
        host: process.env.MYSQL_HOST,
        dialect: 'mysql'
    }
);

// Test MySQL connection
sequelize.authenticate()
    .then(() => console.log('✅ MySQL connected'))
    .catch(err => console.error('❌ MySQL connection error:', err));

// MongoDB (Mongoose) connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

module.exports = { sequelize, mongoose };