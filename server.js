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
  image: String,
  room: String,
  timestamp: { type: Date, default: Date.now },
});


const Message = mongoose.model('Message', messageSchema);


// API to fetch message history
app.get('/messages', async (req, res) => {
  const { room } = req.query;
  if (!room) return res.status(400).send("Room query is required");

  const messages = await Message.find({ room });
  res.json(messages);
});

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('join room', (roomCode) => {
    const room = roomCode || 'global';
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on('chat message', async ({ username, text, image, roomCode }) => {
    const room = roomCode;
    console.log('Saving message to room:', room); // ✅ See which room this message is going to
  
    const newMessage = new Message({ username, text, image, room });
    await newMessage.save();
  
    io.to(room).emit('chat message', {
      username,
      text,
      image,
      room,
      timestamp: newMessage.timestamp,
    });
  });
  

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});


const PORT = process.env.PORT || 3001
const startServer = (port) => {
  server.listen(port, () => {
    console.log(`Server running on port ${port}`)
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is busy, trying ${port + 1}...`)
      startServer(port + 1)
    } else {
      console.error('Server error:', err)
    }
  })
}

startServer(PORT)
