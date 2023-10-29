const passport = require('passport')

/**
 * middleware for authentication
 * @param {any} req
 * @param {any} res
 * @param {any} next
 * @returns {any}
 */
module.exports = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err)
    }

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    req.user = user
    next()
  })(req, res, next)
}
