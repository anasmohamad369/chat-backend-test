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

app.use(cors({
  origin: "*", // OR better: use your frontend URL like "https://yourfrontend.vercel.app"
  methods: ["GET", "POST"]
}));app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now()
  };
  try {
    res.send(healthcheck);
  } catch (error) {
    healthcheck.message = error;
    res.status(503).send();
  }
});

// MongoDB setup with proper error handling
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://anasmohamad369:Anas-2004@cluster0.7zidp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Handle MongoDB connection errors
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

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
  console.log("Query room:", room);

  if (!room) return res.status(400).send("Room query is required");

  try {
    const messages = await Message.find({ room }); // OR use Number(room) if stored as number
    console.log(`Found ${messages.length} messages for room ${room}`);
    res.json(messages);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server error");
  }
});



io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('join room', (roomCode) => {
    const room = roomCode || 'global';
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on('chat message', async ({ username, text, image, roomCode }) => {
    const room = roomCode || 'global'; // fallback if roomCode is missing
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
