const mongoose = require('mongoose')

const tokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: Date.now() + 600000,
  },
  type: {
    type: String,
    enum: ['verify', 'reset'],
    required: true,
  },
})

module.exports = mongoose.model('Token', tokenSchema)
