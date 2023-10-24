const { isValidObjectId } = require('mongoose')
const Models = require('../models/')
const handleFileUpload = require('./handleFileUpload')
const validateToken = require('./validateToken')

/**
 * Validates the specified parameters as MongoDB ObjectIds.
 * @param  {...string} paramNames - The names of the parameters to validate.
 * @returns {Function} Middleware function that validates the parameters.
 */
const validateParamAsObjectId =
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

module.exports = {
  validateParamAsObjectId,
  fetchForm,
  handleFileUpload,
  validateToken,
}
