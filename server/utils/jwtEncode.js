const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const CONFIG = require('../config')

/**
 * Generates a JSON Web Token (JWT) for the given user.
 * @param {Object} user - The user object to generate the token for.
 * @description Generates a JSON Web Token (JWT) for the given user.
 * @returns {string} - The generated JWT.
 */
function generateToken(payload, options) {
  if (!payload) {
    throw new Error('payload is required')
  }

  // Default options
  options = options || { expiresIn: '1h' }

  return jwt.sign(payload, CONFIG.JWT_SECRET_KEY, options)
}

// Function to generate a one-time token
function generateOneTimeToken(data) {
  const token = crypto
    .createHmac('sha256', CONFIG.JWT_SECRET_KEY)
    .update(data)
    .digest('hex')
  return token
}

module.exports = {
  generateToken,
  generateOneTimeToken,
}
