const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const Models = require('../models')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const secretKey = process.env.JWT_SECRET_KEY
const { validateUserRegisterSchema } = require('../utils/validations')
const redis = require('../services/redis')
const { generateOneTimeToken } = require('../utils/jwtEncode')
const { sendWelcomeEmail } = require('../services/mail');

/**
 * Registers user with user_name,email and password
 * @param {any} req
 * @param {any} email
 * @param {any} password
 * @param {any} done
 * @returns {any}
 */
const registerUser = async (req, email, password, done) => {
  const { error } = validateUserRegisterSchema(req.body)
  if (error) {
    return done(error, false)
  }

  try {
    const existingUser = await Models.Users.findOne({ email })

    if (existingUser) {
      return done(null, false, { message: 'Email is already registered' })
    }

    const user = await Models.Users.create({
      email,
      password,
      username: req.body.username,
    })

    if (!user) {
      return done(null, false, { message: 'Something went wrong' })
    }

    const token = user.generateOneTimeToken()
    const Token = await Models.Token.create({ user: user._id, token: token, type: 'verify' })
    sendWelcomeEmail(user.email, user.username, token)

    return done(null, user)
  } catch (error) {
    console.log(error)
    return done(error)
  }
}

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
    let user
    // check if loginID is email or username
    if (loginID.includes('@')) {
      user = await Models.Users.findOne({ email: loginID })
    } else {
      user = await Models.Users.findOne({ username: loginID })
    }

    if (!user) {
      return done(null, false, { message: 'Incorrect email or username.' })
    }
    const isMatch = await user.isValidPassword(password)

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
const verifyUserFromJWT = async (req, jwtPayload, done) => {
  try {
    // Extract token from header
    const token = req.headers.authorization

    //Check if token is stored in redis as blacklisted, if it is, return false
    const tokenExists = await redis.exists(token)
    if (tokenExists) {
      return done(null, false, { message: 'Expired token' })
    }

    return done(null, jwtPayload)
  } catch (error) {
    return done(error, false)
  }
}
/**
 * Initializes passport with the local strategy.
 */
function initialize() {
  passport.use(
    'login',
    new LocalStrategy({ usernameField: 'loginID' }, authenticateUser),
  )
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: secretKey,
    passReqToCallback: true,
  }

  passport.use(new JwtStrategy(jwtOptions, verifyUserFromJWT))
  passport.use(
    'signup',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true,
      },
      registerUser,
    ),
  )
}

module.exports = initialize
