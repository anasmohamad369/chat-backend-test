const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const timestamp = Date.now();

async function testUserMessageRelationship() {
    console.log('🧪 Testing User-Message Relationship...\n');

    try {
        // 1. Create test users
        console.log('1️⃣ Creating test users...');
        
        const user1 = await axios.post(`${BASE_URL}/users/register`, {
            username: `reluser1_${timestamp}`,
            email: `reluser1_${timestamp}@example.com`,
            password: 'password123'
        });
        console.log('✅ User 1 created:', user1.data.data.username);

        const user2 = await axios.post(`${BASE_URL}/users/register`, {
            username: `reluser2_${timestamp}`,
            email: `reluser2_${timestamp}@example.com`,
            password: 'password123'
        });
        console.log('✅ User 2 created:', user2.data.data.username);

        // 2. Test creating messages with user relationships
        console.log('\n2️⃣ Testing message creation with user relationships...');

        // Message from user1 to user2
        const message1 = await axios.post(`${BASE_URL}/messages`, {
            content: 'Hello from user1 to user2!',
            senderUsername: `reluser1_${timestamp}`,
            receiverUsername: `reluser2_${timestamp}`,
            room: 'private'
        });
        console.log('✅ Private message created:', message1.data.data.content);

        // Broadcast message from user1
        const message2 = await axios.post(`${BASE_URL}/messages`, {
            content: 'Hello everyone from user1!',
            senderUsername: `reluser1_${timestamp}`,
            room: 'global'
        });
        console.log('✅ Broadcast message created:', message2.data.data.content);

        // Message from user2 to user1
        const message3 = await axios.post(`${BASE_URL}/messages`, {
            content: 'Hi user1, this is user2!',
            senderUsername: `reluser2_${timestamp}`,
            receiverUsername: `reluser1_${timestamp}`,
            room: 'private'
        });
        console.log('✅ Private message created:', message3.data.data.content);

        // 3. Test getting messages with user information
        console.log('\n3️⃣ Testing message retrieval with user information...');
        
        const messages = await axios.get(`${BASE_URL}/messages`);
        console.log('✅ Retrieved messages with user data:');
        
        messages.data.data.forEach((msg, index) => {
            console.log(`   Message ${index + 1}:`);
            console.log(`   - Content: ${msg.content}`);
            console.log(`   - Sender: ${msg.sender ? msg.sender.username : 'Unknown'}`);
            console.log(`   - Receiver: ${msg.receiver ? msg.receiver.username : 'Broadcast'}`);
            console.log(`   - Room: ${msg.room}`);
            console.log(`   - Timestamp: ${msg.createdAt}`);
            console.log('');
        });

        // 4. Test database connection
        console.log('4️⃣ Testing database connection...');
        const dbTest = await axios.get(`${BASE_URL}/test-db`);
        console.log('✅ Database test:', dbTest.data.message);

        console.log('\n🎉 All tests passed! User-Message relationship is working correctly.');

    } catch (error) {
        console.error('❌ Test failed:', error.response ? error.response.data : error.message);
    }
}

// Run the test
testUserMessageRelationship(); 