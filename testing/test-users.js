const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Test user data
const testUsers = [
  {
    email: "john.doe@example.com",
    username: "john_doe",
    password: "password123"
  },
  {
    email: "jane.smith@example.com", 
    username: "jane_smith",
    password: "securepass456"
  },
  {
    email: "admin@chat.com",
    username: "admin",
    password: "admin123"
  },
  {
    email: "developer@test.com",
    username: "dev_user",
    password: "devpass789"
  },
  {
    email: "user5@example.com",
    username: "user5",
    password: "userpass123"
  }
];

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function registerUser(userData) {
  try {
    log(`\n👤 Registering user: ${userData.username}`, 'blue');
    log(`📧 Email: ${userData.email}`, 'yellow');
    
    const response = await axios.post(`${BASE_URL}/users/register`, userData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    log(`✅ Registration successful!`, 'green');
    log(`📄 Response: ${JSON.stringify(response.data, null, 2)}`, 'green');
    
    return { success: true, data: response.data };
  } catch (error) {
    if (error.response) {
      log(`❌ Registration failed: ${error.response.status}`, 'red');
      log(`📄 Error: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
      return { success: false, error: error.response.data };
    } else {
      log(`❌ Network error: ${error.message}`, 'red');
      return { success: false, error: error.message };
    }
  }
}

async function loginUser(email, password) {
  try {
    log(`\n🔐 Logging in user: ${email}`, 'blue');
    
    const response = await axios.post(`${BASE_URL}/users/login`, {
      email,
      password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    log(`✅ Login successful!`, 'green');
    log(`📄 Response: ${JSON.stringify(response.data, null, 2)}`, 'green');
    
    return { success: true, data: response.data };
  } catch (error) {
    if (error.response) {
      log(`❌ Login failed: ${error.response.status}`, 'red');
      log(`📄 Error: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
      return { success: false, error: error.response.data };
    } else {
      log(`❌ Network error: ${error.message}`, 'red');
      return { success: false, error: error.message };
    }
  }
}

async function testAllUsers() {
  log('🚀 Starting User Registration Tests...', 'blue');
  
  let registeredUsers = [];
  let successfulRegistrations = 0;
  let successfulLogins = 0;
  
  // Register all users
  for (const user of testUsers) {
    const result = await registerUser(user);
    if (result.success) {
      successfulRegistrations++;
      registeredUsers.push(user);
    }
    
    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  log(`\n📊 Registration Results: ${successfulRegistrations}/${testUsers.length} users registered`, 'blue');
  
  // Test login for registered users
  log('\n🔐 Testing Login for Registered Users...', 'blue');
  
  for (const user of registeredUsers) {
    const loginResult = await loginUser(user.email, user.password);
    if (loginResult.success) {
      successfulLogins++;
    }
    
    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  log(`\n📊 Login Results: ${successfulLogins}/${registeredUsers.length} logins successful`, 'blue');
  
  // Test invalid login
  log('\n🧪 Testing Invalid Login...', 'blue');
  await loginUser('nonexistent@example.com', 'wrongpassword');
  
  // Summary
  log(`\n🎯 Final Results:`, 'blue');
  log(`✅ Successful Registrations: ${successfulRegistrations}`, 'green');
  log(`✅ Successful Logins: ${successfulLogins}`, 'green');
  log(`📝 Total Test Users: ${testUsers.length}`, 'yellow');
  
  if (successfulRegistrations === testUsers.length) {
    log('🎉 All user registrations successful!', 'green');
  } else {
    log('⚠️ Some registrations failed (users might already exist)', 'yellow');
  }
}

// Run the tests
testAllUsers().catch(error => {
  log(`❌ Test runner error: ${error.message}`, 'red');
}); 