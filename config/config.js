// Configuration helper
require('dotenv').config();

const config = {
    // Server
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // JWT
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key',
    
    // MySQL
    mysql: {
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT || 3306,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DB
    },
    
    // Email
    email: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
};

// Validate required environment variables
const requiredVars = [
    'MYSQL_HOST',
    'MYSQL_USER', 
    'MYSQL_PASSWORD',
    'MYSQL_DB'
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    console.error('\n📝 Please create a .env file with these variables.');
    console.error('💡 You can copy from .env.example if available.');
}

module.exports = config; 