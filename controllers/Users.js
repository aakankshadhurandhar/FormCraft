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
module.exports.registerUser = async (req, res,next) => {
  
    let { user_name, email, password } = req.body
    user_name = user_name.toLowerCase()
    email = email.toLowerCase()

    // Validate user input
    const { error } = validateUserRegisterSchema({ user_name, email, password })

    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    passport.authenticate('signup', { session: false }, async (err, user) => {
      try {
        if (err) {
          // Handle errors (e.g., duplicate email)
          return res.status(400).json({ message: 'Error during signup', error: err });
        }
  
        if (!user) {
          // Handle failed signup (e.g., duplicate email)
          return res.status(400).json({ message: 'Signup failed, user already exists' });
        }
  
        // User was successfully created
        return res.status(201).json({ message: 'User registered successfully', user });
      } catch (error) {
        // Handle other errors
        return res.status(500).json({ message: 'Internal server error', error });
      }
    })(req, res,next);
}

/**
 * Logs in a user
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response object
 */
module.exports.loginUser = (req, res) => {
  passport.authenticate('login', { session: false }, (err, user, info) => {
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
