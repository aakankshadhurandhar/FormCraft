const { isValidObjectId } = require('mongoose')
const Models = require('../models')
const handleFileUpload = require('./handleFileUpload')
const jwt = require('jsonwebtoken')
const secretKey = process.env.JWT_SECRET_KEY

const areObjectIDs =
  (...paramNames) =>
  (req, res, next) => {
    for (const paramName of paramNames) {
      const paramValue = req.params[paramName]

      if (!isValidObjectId(paramValue)) {
        return res.status(400).json({ message: `Invalid ${paramName}` })
      }
    }
    next()
  }

const fetchForm = async (req, res, next) => {
  const formID = req.params.formID

  if (!isValidObjectId(formID)) {
    return res.status(400).json({ message: `Invalid formID` })
  }

  try {
    const form = await Models.FormPage.findById(formID)

    if (!form) {
      return res.status(404).json({ message: 'Form not found' })
    }

    req.form = form
    next()
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' })
  }
}

//A middleware to check if the user is logged in
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  res.status(401).json({ message: 'User not logged in' })
}

const readJWT = (req, res, next) => {
  const token = req.headers.authorization

  if (token) {
    passport.authenticate('jwt', { session: false }, (err, user) => {
      if (err || !user) {
        return res.status(401).json({ message: 'Invalid token' })
      }

      req.user = user
      next()
    })(req, res)
  } else {
    req.user = undefined
    next()
  }
}

// isFormOwner should call isAuthenticated and fetchForm before it

const formOwnerOnly = async (req, res, next) => {
  try {
    await isAuthenticated(req, res, async () => {
      await fetchForm(req, res, async () => {
        if (!req.user || req.form.userID.toHexString() !== req.user.userID) {
          return res.status(401).json({ message: 'Unauthorized' })
        }

        next()
      })
    })
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  areObjectIDs,
  fetchForm,
  handleFileUpload,
  isAuthenticated,
  formOwnerOnly,
  readJWT,
}
