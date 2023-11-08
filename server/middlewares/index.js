const { isValidObjectId } = require('mongoose')
const Models = require('../models')
const handleFileUpload = require('./handleFileUpload')
const passport = require('passport')

/**
 * Middleware that checks if the specified parameters in the request contain valid MongoDB ObjectIDs.
 * @param  {...string} paramNames - The names of the parameters to check.
 * @description This middleware function checks if the specified parameters in the request contain valid MongoDB ObjectIDs. If any of the parameters are invalid, an error response is sent.
 * @returns {Function} - Express middleware function.
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
 * Middleware to fetch a form by ID and attach it to the request object.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @description This middleware function fetches a form by ID and attaches it to the request object. If the form is not found, an error response is sent.
 * @returns {Object} - Express response object.
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
    return res.status(500).json({ message: 'Internal server error' })
  }
}

/**
 * Middleware function to fetch a form response by ID and attach it to the request object.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @description This middleware function fetches a form response by ID and attaches it to the request object. If the response is not found, an error response is sent.
 * @returns {Object} - Express response object.
 */
const fetchResponse = async (req, res, next) => {
  const responseID = req.params.responseID
  if (!isValidObjectId(responseID)) {
    return res.status(400).json({ message: `Invalid responseID` })
  }

  try {
    const response = await Models.FormResponse.findById(responseID)

    if (!response) {
      return res.status(404).json({ message: 'Response not found' })
    }

    req.response = response
    next()
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' })
  }
}

/**
 * Middleware that checks if the user is authenticated.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @description This middleware function checks if the user is authenticated. If the user is authenticated, the next middleware function is called. Otherwise, an error response is sent.
 */
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  res.status(401).json({ message: 'User not logged in' })
}

/**
 * Middleware that reads the JWT token from the request headers and authenticates it
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @description This middleware function reads the JWT token from the request headers and authenticates it using Passport.js. If the token is valid, the authenticated user is attached to the request object. If the token is invalid or has expired, an error response is sent. If no token is present, the user is set to undefined and the next middleware is called.
 */
const readJWT = (req, res, next) => {
  const token = req.headers.authorization

  if (token) {
    passport.authenticate('jwt', { session: false }, (err, user, details) => {
      if (err || !user) {
        if (details.message === 'Expired token') {
          return res
            .status(401)
            .json({ message: 'Expired token. Please login again' })
        }
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

/**
 * Middleware Chain that checks if the authenticated user is the owner of the form.
 * @function
 * @name formOwnerOnly
 * @returns {Array} An array of middleware functions that includes isAuthenticated, fetchForm, and the formOwnerOnly function.
 * @description This middleware function checks if the authenticated user is the owner of the form. If the user is the owner, the next middleware function is called. Otherwise, an error is returned.
 */
const formOwnerOnly = (function () {
  const fn = (req, res, next) => {
    if (req.form.userID.toHexString() !== req.user.userID) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    next()
  }

  return [isAuthenticated, fetchForm, fn]
})()

/**
 * Middleware that checks if the user has access to a form.
 *
 * @function
 * @name hasFormAccess
 * @returns {Array} An array of middleware functions that includes isAuthenticated, fetchForm, and the access check function.
 *
 * @description
 * This middleware function checks if the user has access to a form by comparing the form's user ID and sharedWith array with the user ID of the authenticated user making the request. If the user has access, the next middleware function is called. Otherwise, an error is returned.
 */
const hasFormAccess = (function () {
  const fn = (req, res, next) => {
    const form = req.form
    if (
      form.userID.toHexString() === req.user.userID ||
      form.sharedWith.includes(req.user.userID)
    ) {
      return next()
    }
    return res.status(401).json({ message: 'Unauthorized', form })
  }

  return [isAuthenticated, fetchForm, fn]
})()

/**
 * Middleware that checks if the user has access to a form based on their role.
 * @param {string} requiredRole - The minimum role required to access the form.
 * @returns {Array} An array of middleware functions to be executed.
 * @description This middleware function checks if the user has access to a form based on their role. It uses Role-Based Access Control (RBAC) logic to determine if the user has the required role to access the form. The requiredRole parameter specifies the minimum role required to access the form. The function returns an array of middleware functions to be executed.
 */
const checkFormAccess = function (requiredRole) {
  // Define role permissions
  const ROLE_PERMISSIONS = {
    public: 0,
    viewer: 1,
    editor: 2,
    admin: 3,
    owner: 4, // owner is always an admin
  }

  // Middleware function to check user role and form access
  const fn = (req, res, next) => {
    const form = req.form
    const user = req.user
    let userRole = 'public' // Default role is public

    if (user) {
      // If user is the owner of the form
      if (form.userID.toHexString() === user.userID) {
        userRole = 'owner'
      }
      // Find user role in sharedWith array or keep the current role
      userRole =
        form.sharedWith.find(
          (sharedUser) => sharedUser.userID.toHexString() === user.userID,
        )?.role || userRole
    }

    // Add user role to the request
    req.userRole = userRole

    // If user role has enough permissions
    if (ROLE_PERMISSIONS[userRole] >= ROLE_PERMISSIONS[requiredRole]) {
      // If user is not authorized to access a draft form
      if (userRole === 'public' && form.published === false) {
        return res.status(401).json({ message: 'Unauthorized' })
      }
      return next()
    }

    // If user role does not have enough permissions, unauthorized
    return res.status(401).json({ message: 'Unauthorized' })
  }

  // If required role is public, only fetch form
  if (requiredRole === 'public') {
    return [fetchForm, fn]
  }
  // If required role is not public, authenticate user and fetch form
  return [isAuthenticated, fetchForm, fn]
}

module.exports = {
  areObjectIDs,
  fetchForm,
  fetchResponse,
  handleFileUpload,
  isAuthenticated,
  formOwnerOnly,
  readJWT,
  hasFormAccess,
  checkFormAccess,
}
