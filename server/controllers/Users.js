const passport = require('passport')
const { validateUserRegisterSchema } = require('../utils/validations')
const { generateToken } = require('../utils/jwtEncode')
const redis = require('../services/redis')

// Registers a new user
module.exports.registerUser = async (req, res, next) => {
  let { username, email, password } = req.body

  username = username.toLowerCase()
  email = email.toLowerCase()

  // Validate user input
  const { error } = validateUserRegisterSchema({ username, email, password })
  if (error) {
    return res.sendBadRequest('Validation failed', error)
  }

  passport.authenticate('signup', { session: false }, async (err, user) => {
    try {
      if (err) {
        // Handle errors (e.g., duplicate email)
        return res.sendBadRequest('Error during signup', err)
      }

      if (!user) {
        // Handle failed signup (e.g., duplicate email)
        return res.sendBadRequest('Signup failed, user already exists')
      }

      // User was successfully created
      return res.sendResponse('User registered successfully', user, 201)
    } catch (error) {
      return res.sendInternalServerError(error)
    }
  })(req, res, next)
}

// Logs in a user
module.exports.loginUser = (req, res) => {
  passport.authenticate('login', { session: false }, (err, user, info) => {
    if (err) {
      return res.sendInternalServerError(err)
    }
    if (!user) {
      return res.sendBadRequest('Incorrect loginID or password', info)
    }

    const token = user.generateToken()
    return res.sendResponse('User logged in successfully', { token })
  })(req, res)
}

// logoutUser
module.exports.logoutUser = async (req, res) => {
  // get the token from the header
  const token = req.headers.authorization

  //add it to the redis blacklist
  await redis
    .set(token, 'blacklisted', 'EX', 60 * 60 * 24 * 7)
    .then(() => {
      return res.sendSucces()
    })
    .catch((err) => {
      return res.sendInternalServerError(err)
    })
}
