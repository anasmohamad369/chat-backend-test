const User = require('./User');
const Message = require('./Message');

// Sender association
Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
// Receiver association
Message.belongsTo(User, { as: 'receiver', foreignKey: 'receiverId' });

module.exports = { User, Message };