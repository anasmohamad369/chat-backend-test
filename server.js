const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

// MongoDB setup
mongoose.connect('mongodb+srv://anasmohamad369:Anas-2004@cluster0.7zidp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0') // Use your MongoDB connection string

const messageSchema = new mongoose.Schema({
  username: String,
  text: String,
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);

// API to fetch message history
app.get('/messages', async (req, res) => {
  const messages = await Message.find().sort({ timestamp: 1 }).limit(100);
  res.json(messages);
});

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('chat message', async (msg) => {
    const { username, text } = msg;
    const newMsg = new Message({ username, text });
    await newMsg.save();

    io.emit('chat message', newMsg);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});

