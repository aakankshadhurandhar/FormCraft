const jwt = require('jsonwebtoken')
const secretKey = process.env.JWT_SECRET_KEY

function generateToken(user) {
  const payload = {
    user_name: user.user_name,
    email: user.email,
    userID: user._id.toHexString()
  }

  const options = {
    expiresIn: '1h',
  }

  return jwt.sign(payload, secretKey, options)
}

module.exports = {
  generateToken,
}
