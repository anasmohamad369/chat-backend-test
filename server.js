// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // allow all for testing
  },
});

io.on('connection', (socket) => {
  console.log('New user connected');

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg); // send to everyone
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});
