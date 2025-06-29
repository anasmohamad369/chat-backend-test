require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { sequelize } = require('./config/database');
const otpRoutes = require('./routes/otpRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"]
}));

app.use(express.json());

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

// Use routes
app.use('/otp', otpRoutes);
app.use('/users', userRoutes);
app.use('/', messageRoutes);

// Socket.io logic
io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('join room', (roomCode) => {
    const room = roomCode || 'global';
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on("chat message", async ({ username, text, image, roomCode }) => {
    console.log("📨 Received:", { username, text, image, roomCode });

    const room = roomCode || "global";
    if (!room) {
      console.error("❌ NO ROOM PROVIDED — NOT SAVING MESSAGE");
      return;
    }

    const newMessage = new Message({ username, text, image, room });
    await newMessage.save();

    console.log("✅ Saved message to room:", room);

    io.to(room).emit("chat message", {
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

const PORT = process.env.PORT || 3001;

const startServer = (port) => {
  server.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`)
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${port} is busy, trying ${port + 1}...`)
      startServer(port + 1)
    } else {
      console.error('💥 Server error:', err)
    }
  })
}

// Sync Sequelize (MySQL) before starting the server
sequelize.sync().then(() => {
  startServer(PORT);
});



