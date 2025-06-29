const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  username: String,
  text: String,
  image: String,
  room: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', messageSchema);