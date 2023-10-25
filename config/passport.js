const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('../models/users')
const { comparePasswords } = require('../utils/passwordValidation')
const Models = require('../models')

/**
 * Authenticates a user with the given login ID and password.
 * @param {string} loginID - The user's email or username.
 * @param {string} password - The user's password.
 * @param {function} done - The callback function to call when authentication is complete.
 * @returns {Promise<void>}
 */
const authenticateUser = async (loginID, password, done) => {
  try {
    loginID = loginID.toLowerCase()
    const user = await Models.Users.findOne({
      $or: [{ email: loginID }, { user_name: loginID }],
    })

    if (!user) {
      return done(null, false, { message: 'Incorrect email or username.' })
    }
    const isMatch = await comparePasswords(password, user.password)
    if (!isMatch) {
      return done(null, false, { message: 'Incorrect password' })
    }

    return done(null, user)
  } catch (error) {
    return done(error)
  }
}

/**
 * Initializes passport with the local strategy.
 */
function initialize() {
  passport.use(
    new LocalStrategy({ usernameField: 'loginID' }, authenticateUser),
  )
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id)
      done(null, user)
    } catch (error) {
      done(error, null)
    }
  })
}

module.exports = initialize
