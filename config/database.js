require('dotenv').config();
const { Sequelize } = require('sequelize');
const mongoose = require('mongoose');

// Debug: Log environment variables
console.log('🔍 Database Configuration:');
console.log('Host:', process.env.MYSQL_HOST);
console.log('Port:', process.env.MYSQL_PORT);
console.log('Database:', process.env.MYSQL_DB);
console.log('User:', process.env.MYSQL_USER);

// MySQL (Sequelize) connection
const sequelize = new Sequelize(
    process.env.MYSQL_DB,
    process.env.MYSQL_USER,
    process.env.MYSQL_PASSWORD,
    {
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT || 3306,
        dialect: 'mysql',
        logging: false, // Disable SQL logging
        retry: {
            max: 3,
            timeout: 5000
        }
    }
);

// Test MySQL connection with error handling
const testMySQLConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ MySQL connected');
    } catch (err) {
        console.error('❌ MySQL connection error:', err.message);
        console.log('⚠️ Server will continue without MySQL connection');
    }
};

// MongoDB (Mongoose) connection with error handling
const testMongoDBConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        console.log('⚠️ Server will continue without MongoDB connection');
    }
};

// Test connections
testMySQLConnection();
testMongoDBConnection();

module.exports = { sequelize, mongoose };