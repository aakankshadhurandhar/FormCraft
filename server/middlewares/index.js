const { isValidObjectId } = require('mongoose')
const Models = require('../models')
const passport = require('passport')
const redis = require('../services/redis')

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
        return res.sendBadRequest(`Invalid ${paramName}`)
        // return res.status(400).json({ message: `Invalid ${paramName}` })
      }
    }
    next()
  }

const fetchForm = async (req, res, next) => {
  const formID = req.params.formID
  if (!isValidObjectId(formID)) {
    return res.sendBadRequest(`Invalid formID`)
    // return res.status(400).json({ message: `Invalid formID` })
  }

  try {
    const formJSONString = await redis.getex(formID, 'EX', 600)

    if (formJSONString) {
      const form = new Models.FormPage(JSON.parse(formJSONString))
      await form.populate('owner', 'username _id')
      await form.populate('sharedWith.user', 'username _id')
      req.form = form
      return next()
    }
    const form = await Models.FormPage.findById(formID)
      .populate('owner', 'username _id')
      .populate('sharedWith.user', 'username _id')

    if (!form) {
      return res.sendNotFound('Form not found')
      // return res.status(404).json({ message: 'Form not found' })
    }
    // Save in redis
    redis.setex(formID, 600, JSON.stringify(form.toObject()))
    req.form = form
    next()
  } catch (err) {
    return res.sendInternalServerError(err)
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
    return res.sendBadRequest(`Invalid responseID`)
    return res.status(400).json({ message: `Invalid responseID` })
  }

  try {
    const response = await Models.FormResponse.findById(responseID)

    if (!response) {
      return res.sendNotFound('Response not found')
      // return res.status(404).json({ message: 'Response not found' })
    }

    req.response = response
    next()
  } catch (err) {
    return res.sendInternalServerError(err)
    // return res.status(500).json({ message: 'Internal server error' })
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
  return res.sendUnauthorized('User not authenticated')
  // res.status(401).json({ message: 'User not logged in' })
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
        if (details?.message === 'Expired token') {
          return res.sendUnauthorized('Expired token. Please login again')
          // return res
          //   .status(401)
          //   .json({ message: 'Expired token. Please login again' })
        }
        return res.sendUnauthorized('Invalid token')
        // return res.status(401).json({ message: 'Invalid token' })
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
      if (form.owner.username === user.username) {
        userRole = 'owner'
      }
      // Find user role in sharedWith array or keep the current role
      userRole =
        form.sharedWith.find(
          (sharedUser) => sharedUser.user.username === user.username,
        )?.role || userRole
    }

    // Add user role to the request
    req.userRole = userRole

    // If user role has enough permissions
    if (ROLE_PERMISSIONS[userRole] >= ROLE_PERMISSIONS[requiredRole]) {
      // If user is not authorized to access a draft form
      if (userRole === 'public' && form.published === false) {
        return res.sendForbidden()
        // return res.status(403).json({ message: 'Forbidden' })
      }
      return next()
    }

    // If user role does not have enough permissions, unauthorized
    return res.sendUnauthorized()
    // return res.status(401).json({ message: 'Unauthorized' })
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
  isAuthenticated,
  readJWT,
  checkFormAccess,
}
