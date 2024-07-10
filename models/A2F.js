const mongoose = require('mongoose');
const { Schema } = mongoose;

const a2fCodeSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  code: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // 5 minutes
  },
  expiresAt: {
    type: Date,
    required: true,
  }
});

module.exports = mongoose.model('A2FCode', a2fCodeSchema);
