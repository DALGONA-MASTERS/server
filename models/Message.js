// models/Message.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String }, 
    iv: { type: String }, 
    audio: { type: String }, 
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);