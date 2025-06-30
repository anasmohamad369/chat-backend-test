const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Test data
const testData = {
  validMessage: {
    content: "Hello, this is a test message",
    senderId: "test_user_1",
    receiverId: "test_user_2"
  },
  validUser: {
    email: "test@example.com",
    username: "testuser",
    password: "password123"
  },
  invalidMessage: {
    content: "Missing required fields"
  }
};

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

async function testEndpoint(name, method, url, data = null, expectedStatus = 200) {
  try {
    log(`\n🧪 Testing: ${name}`, 'blue');
    log(`📍 ${method} ${url}`, 'yellow');
    
    if (data) {
      log(`📦 Data: ${JSON.stringify(data, null, 2)}`, 'yellow');
    }

    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    
    log(`✅ Status: ${response.status}`, 'green');
    log(`📄 Response: ${JSON.stringify(response.data, null, 2)}`, 'green');
    
    return response.status === expectedStatus;
  } catch (error) {
    if (error.response) {
      log(`❌ Status: ${error.response.status}`, 'red');
      log(`📄 Error Response: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
      return error.response.status === expectedStatus;
    } else {
      log(`❌ Network Error: ${error.message}`, 'red');
      return false;
    }
  }
}

async function runAllTests() {
  log('🚀 Starting API Tests...', 'blue');
  
  let passed = 0;
  let total = 0;

  // Test 1: Health Check
  total++;
  if (await testEndpoint('Health Check', 'GET', '/health')) passed++;

  // Test 2: Database Test
  total++;
  if (await testEndpoint('Database Test', 'GET', '/test-db')) passed++;

  // Test 3: Get Messages (should be empty or have existing messages)
  total++;
  if (await testEndpoint('Get Messages', 'GET', '/messages')) passed++;

  // Test 4: Create Valid Message
  total++;
  if (await testEndpoint('Create Valid Message', 'POST', '/messages', testData.validMessage, 201)) passed++;

  // Test 5: Create Message with Room
  total++;
  const messageWithRoom = { ...testData.validMessage, room: 'test-room' };
  if (await testEndpoint('Create Message with Room', 'POST', '/messages', messageWithRoom, 201)) passed++;

  // Test 6: Create Invalid Message (missing fields)
  total++;
  if (await testEndpoint('Create Invalid Message', 'POST', '/messages', testData.invalidMessage, 400)) passed++;

  // Test 7: Get Messages Again (should have new messages)
  total++;
  if (await testEndpoint('Get Messages After Creation', 'GET', '/messages')) passed++;

  // Test 8: User Registration
  total++;
  if (await testEndpoint('User Registration', 'POST', '/users/register', testData.validUser, 201)) passed++;

  // Test 9: User Login
  total++;
  const loginData = {
    email: testData.validUser.email,
    password: testData.validUser.password
  };
  if (await testEndpoint('User Login', 'POST', '/users/login', loginData)) passed++;

  // Test 10: Invalid Login (wrong password)
  total++;
  const invalidLoginData = {
    email: testData.validUser.email,
    password: 'wrongpassword'
  };
  if (await testEndpoint('Invalid Login', 'POST', '/users/login', invalidLoginData, 400)) passed++;

  // Test 11: Test with missing content
  total++;
  const missingContent = {
    senderId: "user1",
    receiverId: "user2"
  };
  if (await testEndpoint('Missing Content', 'POST', '/messages', missingContent, 400)) passed++;

  // Test 12: Test with missing senderId
  total++;
  const missingSender = {
    content: "Test message",
    receiverId: "user2"
  };
  if (await testEndpoint('Missing Sender ID', 'POST', '/messages', missingSender, 400)) passed++;

  // Test 13: Test with missing receiverId
  total++;
  const missingReceiver = {
    content: "Test message",
    senderId: "user1"
  };
  if (await testEndpoint('Missing Receiver ID', 'POST', '/messages', missingReceiver, 400)) passed++;

  // Summary
  log(`\n📊 Test Results: ${passed}/${total} tests passed`, passed === total ? 'green' : 'red');
  
  if (passed === total) {
    log('🎉 All tests passed! Your API is working correctly.', 'green');
  } else {
    log('⚠️ Some tests failed. Check the errors above.', 'red');
  }
}

// Run tests
runAllTests().catch(error => {
  log(`❌ Test runner error: ${error.message}`, 'red');
}); 