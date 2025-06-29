require('dotenv').config();
const { Sequelize } = require('sequelize');

// Debug: Log environment variables
console.log('🔍 Database Configuration:');
console.log('Host:', process.env.MYSQL_HOST);
console.log('Port:', process.env.MYSQL_PORT);
console.log('Database:', process.env.MYSQL_DB);
console.log('User:', process.env.MYSQL_USER);
console.log('Password length:', process.env.MYSQL_PASSWORD ? process.env.MYSQL_PASSWORD.length : 'undefined');

// Check if environment variables are loaded
if (!process.env.MYSQL_HOST || process.env.MYSQL_HOST === 'localhost') {
    console.error('❌ ERROR: MYSQL_HOST is not set correctly or is localhost');
    console.error('Please check your .env file or environment variables');
}

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
        
        // Sync database (create tables if they don't exist)
        await sequelize.sync({ alter: true });
        console.log('✅ MySQL tables synced');
    } catch (err) {
        console.error('❌ MySQL connection error:', err.message);
        console.log('⚠️ Server will continue without MySQL connection');
    }
};

// Test connections
testMySQLConnection();

module.exports = { sequelize };