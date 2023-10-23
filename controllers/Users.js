const users = require('../models/users')
const passport = require('passport')
const jwt = require('jsonwebtoken')
const secretKey = process.env.JWT_SECRET_KEY
const { hashPassword } = require('../utils/passwordValidation')
const { validateUserSchema } = require('../validators/validations')
const { generateToken } = require('../utils/jwtEncode')

module.exports.registerUser = async (req, res) => {
  try {
    const { user_name, email, password } = req.body
    const { error } = validateUserSchema(req.body)

    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const existingUser = await users.findOne({ email })

    if (existingUser) {
      return loginUser(req, res)
    }

    const hashedPassword = await hashPassword(password)
    const newUser = new users({ user_name, password: hashedPassword, email })

    await newUser.save()
    loginUser(req, res)
  } catch (err) {
    console.log(err)
    res.status(500).json({ statusCode: 500, message: 'Internal server error' })
  }
}

function loginUser(req, res) {
  passport.authenticate('local', (err, user) => {
    if (err || !user) {
      return res
        .status(500)
        .json({
          message: 'Registration successful, but login failed',
          error: err,
        })
    }

    req.logIn(user, async (err) => {
      if (err) {
        return res
          .status(500)
          .json({
            message: 'Registration successful, but login failed',
            error: err,
          })
      }
      const token = generateToken(user)
      try {
        // const user = await users.findOne({'email':req.body.email});
        res.json({
          message: 'User registered and logged in successfully',
          token,
        })
      } catch (error) {
        return res
          .status(500)
          .json({
            message:
              'Registration successful, but unable to retrieve user details',
            error: error,
          })
      }
    })
  })(req, res)
}
