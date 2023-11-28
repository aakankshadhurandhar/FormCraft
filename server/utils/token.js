const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const CONFIG = require('../config')

/**
 * Generates a JSON Web Token (JWT) for the given user.
 * @param {Object} user - The user object to generate the token for.
 * @description Generates a JSON Web Token (JWT) for the given user.
 * @returns {string} - The generated JWT.
 */
function generateJWTToken(payload, options) {
  if (!payload) {
    throw new Error('payload is required')
  }

  // Default options
  options = options || { expiresIn: '1h' }

  return jwt.sign(payload, CONFIG.JWT_SECRET_KEY, options)
}

// Function to generate a one-time token
function generateOneTimeToken() {
  const token = crypto.randomBytes(32).toString('hex')
  return token
}

module.exports = {
  generateJWTToken,
  generateOneTimeToken,
}
