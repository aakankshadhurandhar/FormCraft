const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const Models = require('../models/index') // Import your models
const secretKey = process.env.JWT_SECRET_KEY // Replace with your secret key

// Configure the JWT strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: secretKey,
}

passport.use(
  new JwtStrategy(jwtOptions, async (jwtPayload,req, done) => {
    console.log(req);
    try {
      if (!jwtPayload) {
        return done(null, false, { message: 'Token missing', statusCode: 401 })
      }
      const user = await Models.Users.findOne({ email: jwtPayload.email })

      if (!user) {
        return done(null, false)
      }
      return done(null, user)
    } catch (error) {
      return done(error, false, {
        statusCode: 401,
        message: 'Authentication error',
      })
    }
  }),
)

// Export the authentication middleware
module.exports = (req, res, next) => {
    passport.authenticate('jwt', { session: false })(req, res, next);
  };
