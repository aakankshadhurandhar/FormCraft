const Models = require('../models')
module.exports = async (req, res, next) => {
  if (req.user) {
    try {
      const userEmail = req.user
      const userID = await Models.Users.findOne({ email: userEmail })
      if (
        req.form.userID.toHexString() === userID._id.toHexString()
      ) {
        next()
      } else {
        res.status(401).json({ message: 'Unauthorized' })
      }
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' })
    }
  } else {
    res.status(401).json({ message: 'Unauthorized' })
  }
}
