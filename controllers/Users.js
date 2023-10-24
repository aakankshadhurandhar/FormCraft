const users = require('../models/users')
const passport = require('passport')
const jwt = require('jsonwebtoken')
const secretKey = process.env.JWT_SECRET_KEY
const { hashPassword } = require('../utils/passwordValidation')
const {
  validateUserLoginSchema,
  validateUserRegisterSchema,
} = require('../validators/validations')
const { generateToken } = require('../utils/jwtEncode')

module.exports.registerUser = async (req, res) => {
  try {
    const { user_name, email, password } = req.body

    const { error } = validateUserRegisterSchema(req.body)

    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }
    const existingUser = await users.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: 'user already exists' })
    }
    const hashedPassword = await hashPassword(password)
    const newUser = new users({ user_name, password: hashedPassword, email })

    await newUser.save()
    res.status(200).json({ statusCode: 200, message: 'user cereated' })
  } catch (err) {
    console.log(err)
    res.status(500).json({ statusCode: 500, message: 'Internal server error' })
  }
}
module.exports.loginUser = (req, res) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: 'Internal Server Error' })
    }
    if (!user) {
      return res
        .status(401)
        .json({
          message: 'Authentication failed - Incorrect email or password',
        })
    }

    req.logIn(user, async (err) => {
      if (err) {
        return res.status(500).json({
          message: 'Login failed - Internal Server Error',
          error: err,
        })
      }

      const token = generateToken(user)

      res.json({
        message: 'User logged in successfully',
        token,
      })
    })
  })(req, res)
}
