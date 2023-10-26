const { isValidObjectId } = require('mongoose')
const Models = require('../models')
const handleFileUpload = require('./handleFileUpload')
const jwt = require('jsonwebtoken')
const secretKey = process.env.JWT_SECRET_KEY

/**
 * Validates the specified parameters as MongoDB ObjectIds.
 * @param  {...string} paramNames - The names of the parameters to validate.
 * @returns {Function} Middleware function that validates the parameters.
 */
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

/**
 * Fetches the form with the specified ID and attaches it to the request object.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Promise<void>} Resolves when the form is fetched and attached to the request object.
 */
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
    console.error(err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

/**
 * Validates the token in the request header.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} - The response object with an error message if the token is missing or invalid.
 */
const validateToken = (req, res, next) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Token is missing' })
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token is invalid or expired' })
    }

    req.userID = decoded.email

    next()
  })
}

//A middleware to check if the user is logged in
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  res.status(401).json({ message: 'User not logged in' })
}

module.exports = {
  areObjectIDs,
  fetchForm,
  handleFileUpload,
  validateToken,
  isAuthenticated,
}
