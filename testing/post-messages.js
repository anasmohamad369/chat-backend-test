const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Sample messages to post
const sampleMessages = [
  {
    content: "Hello everyone! Welcome to the chat room! 👋",
    senderId: "john_doe",
    receiverId: "all",
    room: "general"
  },
  {
    content: "Hi John! How are you doing today?",
    senderId: "jane_smith",
    receiverId: "john_doe",
    room: "general"
  },
  {
    content: "I'm doing great, thanks for asking! 😊",
    senderId: "john_doe",
    receiverId: "jane_smith",
    room: "general"
  },
  {
    content: "This is an important announcement from admin",
    senderId: "admin",
    receiverId: "all",
    room: "announcements"
  },
  {
    content: "Meeting scheduled for tomorrow at 10 AM",
    senderId: "admin",
    receiverId: "all",
    room: "work"
  },
  {
    content: "Thanks for the update, admin!",
    senderId: "dev_user",
    receiverId: "admin",
    room: "work"
  },
  {
    content: "Working on the new feature today",
    senderId: "dev_user",
    receiverId: "all",
    room: "development"
  },
  {
    content: "Need help with the API integration",
    senderId: "user5",
    receiverId: "dev_user",
    room: "support"
  },
  {
    content: "I can help you with that! Let's discuss",
    senderId: "dev_user",
    receiverId: "user5",
    room: "support"
  },
  {
    content: "Great! When can we meet?",
    senderId: "user5",
    receiverId: "dev_user",
    room: "support"
  },
  {
    content: "How about 2 PM today?",
    senderId: "dev_user",
    receiverId: "user5",
    room: "support"
  },
  {
    content: "Perfect! See you then",
    senderId: "user5",
    receiverId: "dev_user",
    room: "support"
  },
  {
    content: "Anyone up for a coffee break? ☕",
    senderId: "jane_smith",
    receiverId: "all",
    room: "general"
  },
  {
    content: "Count me in!",
    senderId: "john_doe",
    receiverId: "jane_smith",
    room: "general"
  },
  {
    content: "Me too! Let's go to the new cafe",
    senderId: "user5",
    receiverId: "all",
    room: "general"
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

async function postMessage(messageData, index) {
  try {
    log(`\n📨 Posting message ${index + 1}/${sampleMessages.length}`, 'blue');
    log(`👤 From: ${messageData.senderId}`, 'yellow');
    log(`📝 Content: ${messageData.content}`, 'yellow');
    log(`🏠 Room: ${messageData.room}`, 'yellow');
    
    const response = await axios.post(`${BASE_URL}/messages`, messageData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    log(`✅ Message posted successfully!`, 'green');
    log(`🆔 Message ID: ${response.data.data.id}`, 'green');
    
    return { success: true, data: response.data };
  } catch (error) {
    if (error.response) {
      log(`❌ Failed to post message: ${error.response.status}`, 'red');
      log(`📄 Error: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
      return { success: false, error: error.response.data };
    } else {
      log(`❌ Network error: ${error.message}`, 'red');
      return { success: false, error: error.message };
    }
  }
}

async function postMessagesInBatches(batchSize = 3) {
  log('🚀 Starting to post messages in batches...', 'blue');
  log(`📦 Batch size: ${batchSize} messages`, 'yellow');
  
  let successfulPosts = 0;
  let failedPosts = 0;
  let batchNumber = 1;
  
  // Process messages in batches
  for (let i = 0; i < sampleMessages.length; i += batchSize) {
    const batch = sampleMessages.slice(i, i + batchSize);
    
    log(`\n📦 Processing Batch ${batchNumber} (${batch.length} messages)`, 'blue');
    
    // Post messages in current batch
    const batchPromises = batch.map((message, index) => 
      postMessage(message, i + index)
    );
    
    const batchResults = await Promise.all(batchPromises);
    
    // Count results
    batchResults.forEach(result => {
      if (result.success) {
        successfulPosts++;
      } else {
        failedPosts++;
      }
    });
    
    log(`📊 Batch ${batchNumber} completed: ${batchResults.filter(r => r.success).length}/${batch.length} successful`, 'blue');
    
    batchNumber++;
    
    // Wait between batches
    if (i + batchSize < sampleMessages.length) {
      log('⏳ Waiting 2 seconds before next batch...', 'yellow');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Final summary
  log(`\n🎯 Final Results:`, 'blue');
  log(`✅ Successful posts: ${successfulPosts}`, 'green');
  log(`❌ Failed posts: ${failedPosts}`, 'red');
  log(`📝 Total messages: ${sampleMessages.length}`, 'yellow');
  
  if (successfulPosts === sampleMessages.length) {
    log('🎉 All messages posted successfully!', 'green');
  } else {
    log('⚠️ Some messages failed to post', 'red');
  }
  
  return { successfulPosts, failedPosts, total: sampleMessages.length };
}

async function getAllMessages() {
  try {
    log('\n📋 Fetching all messages from database...', 'blue');
    
    const response = await axios.get(`${BASE_URL}/messages`);
    
    log(`✅ Retrieved ${response.data.data.length} messages`, 'green');
    
    // Group messages by room
    const messagesByRoom = {};
    response.data.data.forEach(message => {
      const room = message.room;
      if (!messagesByRoom[room]) {
        messagesByRoom[room] = [];
      }
      messagesByRoom[room].push(message);
    });
    
    log('\n📊 Messages by Room:', 'blue');
    Object.keys(messagesByRoom).forEach(room => {
      log(`🏠 ${room}: ${messagesByRoom[room].length} messages`, 'yellow');
    });
    
    return response.data.data;
  } catch (error) {
    log(`❌ Failed to fetch messages: ${error.message}`, 'red');
    return [];
  }
}

async function runMessagePosting() {
  log('🚀 Starting Message Posting Test...', 'blue');
  
  // Post messages in batches
  const results = await postMessagesInBatches(3);
  
  // Wait a moment then fetch all messages
  log('\n⏳ Waiting 3 seconds before fetching messages...', 'yellow');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Get all messages to verify storage
  await getAllMessages();
  
  log('\n✨ Message posting test completed!', 'green');
}

// Run the script
runMessagePosting().catch(error => {
  log(`❌ Script error: ${error.message}`, 'red');
}); 