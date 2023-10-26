const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('../models/users')
const { comparePasswords } = require('../utils/passwordValidation')
const Models = require('../models')
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const secretKey = process.env.JWT_SECRET_KEY;

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
 * Verifies a user's JWT and calls the 'done' callback for the JWT strategy.
 * @param {object} jwtPayload - The payload extracted from the JWT token.
 * @param {function} done - The callback function to call when authentication is complete.
 */
const verifyUserFromJWT = async (jwtPayload, done) => {
  try {

    return done(null, jwtPayload.email);
  } catch (error) {
    return done(error, false);
  }
};
/**
 * Initializes passport with the local strategy.
 */
function initialize() {
  passport.use(
    new LocalStrategy({ usernameField: 'loginID' }, authenticateUser),
  )
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: secretKey,
  };

  passport.use(new JwtStrategy(jwtOptions, verifyUserFromJWT));

}

module.exports = initialize
