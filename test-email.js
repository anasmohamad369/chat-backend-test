require('dotenv').config();
const transporter = require('./config/mailer');

async function testEmail() {
    console.log('🧪 Testing Email Configuration...\n');
    
    console.log('📧 Email User:', process.env.EMAIL_USER);
    console.log('🔑 Email Pass:', process.env.EMAIL_PASS ? '***configured***' : '❌ NOT CONFIGURED');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('\n❌ Email configuration missing!');
        console.log('Please add to your .env file:');
        console.log('EMAIL_USER=your-email@gmail.com');
        console.log('EMAIL_PASS=your-16-character-app-password');
        return;
    }
    
    try {
        console.log('\n📤 Sending test email...');
        
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to yourself for testing
            subject: 'Test Email from Chat Backend',
            text: 'This is a test email from your chat backend! 🎉',
            html: '<h1>Test Email</h1><p>This is a test email from your chat backend! 🎉</p>'
        });
        
        console.log('✅ Email sent successfully!');
        console.log('📧 Message ID:', info.messageId);
        console.log('📬 Check your inbox:', process.env.EMAIL_USER);
        
    } catch (error) {
        console.error('❌ Email test failed:', error.message);
        console.log('\n🔧 Troubleshooting tips:');
        console.log('1. Make sure 2-Step Verification is enabled on your Google account');
        console.log('2. Generate a new App Password for "Mail"');
        console.log('3. Use the 16-character app password (not your regular password)');
        console.log('4. Remove spaces from the app password if any');
    }
}

testEmail(); 