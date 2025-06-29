const Message = require('../models/Message');
const mongoose = require('mongoose');

exports.getMessages = async (req, res) => {
  const { room } = req.query;
  if (!room) return res.status(400).send("Room query is required");
  try {
    const messages = await Message.find({ room: String(room) });
    res.json(messages);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Error fetching messages");
  }
};

exports.testDb = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const stats = await db.stats();
    res.json({
      database: db.databaseName,
      collections: collections.map(c => c.name),
      stats: stats,
      connectionState: mongoose.connection.readyState
    });
  } catch (error) {
    console.error('Test DB error:', error);
    res.status(500).send('Test DB error');
  }
};