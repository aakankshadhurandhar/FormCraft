const passport = require('passport')
const { hashPassword } = require('../utils/passwordValidation')
const { validateUserRegisterSchema } = require('../validators/validations')
const { generateToken } = require('../utils/jwtEncode')
const Models = require('../models')

/**
 * Registers a new user
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response object
 */
module.exports.registerUser = async (req, res) => {
  try {
    let { user_name, email, password } = req.body
    user_name = user_name.toLowerCase()
    email = email.toLowerCase()

    // Validate user input
    const { error } = validateUserRegisterSchema({ user_name, email, password })

    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const existingUser = await Models.Users.findOne({
      $or: [{ user_name }, { email }],
    })

    if (existingUser) {
      return res
        .status(400)
        .json({ error: 'user with same username or email already exists' })
    }

    const hashedPassword = await hashPassword(password)
    const newUser = new Models.Users({
      user_name,
      password: hashedPassword,
      email,
    })

    await newUser.save()
    res.status(201).json({ statusCode: 201, message: 'user created' })
  } catch (err) {
    console.log(err)
    res.status(500).json({ statusCode: 500, message: 'Internal server error' })
  }
}

/**
 * Logs in a user
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response object
 */
module.exports.loginUser = (req, res) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: 'Internal Server Error', info })
    }
    if (!user) {
      return res
        .status(401)
        .json({ message: 'Incorrect loginID or password', info })
    }

    const token = generateToken(user)
    res.json({ message: 'User logged in successfully', token })
  })(req, res)
}
