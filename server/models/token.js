const mongoose = require('mongoose')
const tokenHelper = require('../utils/token')

const tokenSchema = new mongoose.Schema({
  token: {
    type: String,
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

// if token is not given in the request during create, generate a new one
tokenSchema.pre('save', function (next) {
  if (!this.token) {
    this.token = tokenHelper.generateOneTimeToken()
  }
  next()
})

module.exports = mongoose.model('Token', tokenSchema)
