const { isValidObjectId } = require('mongoose')

// Validate ObjectId parameters
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

module.exports = { validateParamAsObjectId }
