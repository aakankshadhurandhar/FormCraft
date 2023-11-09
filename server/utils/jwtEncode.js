const jwt = require('jsonwebtoken')
const secretKey = process.env.JWT_SECRET_KEY

/**
 * Generates a JSON Web Token (JWT) for the given user.
 * @param {Object} user - The user object to generate the token for.
 * @description Generates a JSON Web Token (JWT) for the given user.
 * @returns {string} - The generated JWT.
 */
function generateToken(user) {
  const payload = {
    user_name: user.user_name,
    email: user.email,
    userID: user._id.toHexString(),
  }

  const options = {
    expiresIn: '1h',
  }

  return jwt.sign(payload, secretKey, options)
}

module.exports = {
  generateToken,
}
