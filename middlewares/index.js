const { isValidObjectId } = require('mongoose')
const Models = require('../models')
const handleFileUpload = require('./handleFileUpload')
const jwt = require('jsonwebtoken')
const passport = require('passport')
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

const formOwnerOnly = (function () {
  const fn = (req, res, next) => {
    if (req.form.userID.toHexString() !== req.user.userID) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    next()
  }

  return [isAuthenticated, fetchForm, fn]
})()

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

// a middleware for the new rbac system, viewer (Read only),editor (Read, update), admin (Read,update, delete).
// if the user is the owner of the form, they are automatically an admin
// if the form is published, all users are viewers except specified editors and admins
// admin is also an editor, editor is also a viewer

const checkFormAccess = function (requiredRole) {
  const ROLE_PERMISSIONS = {
    public: 0,
    viewer: 1,
    editor: 2,
    admin: 3,
    owner: 4, // owner is always an admin
  }

  const fn = (req, res, next) => {
    const form = req.form
    const user = req.user
    let userRole = 'public'

    if (user) {
      if (form.userID.toHexString() === user.userID) {
        userRole = 'owner'
        console.log('user is owner')
      }
      userRole =
        form.sharedWith.find(
          (sharedUser) => sharedUser.userID.toHexString() === user.userID,
        )?.role || userRole
    }

    req.userRole = userRole
    if (ROLE_PERMISSIONS[userRole] >= ROLE_PERMISSIONS[requiredRole]) {
      if (userRole === 'public' && form.published === false) {
        return res.status(401).json({ message: 'Unauthorized' })
      }
      return next()
    }

    return res.status(401).json({ message: 'Unauthorized' })
  }

  if (requiredRole === 'public') {
    return [fetchForm, fn]
  }
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
