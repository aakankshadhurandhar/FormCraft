const Controllers = require('../../controllers')
const router = require('express').Router()
const { isAuthenticated } = require('../../middlewares')

// Verify User with token sent to email
router.get('/verify', Controllers.Users.verifyUser)

// send a verification email to the user
router.post(
  '/verify',
  isAuthenticated,
  Controllers.Users.verificationEmailRequest,
)

// Change Password
router.post(
  '/change-password',
  isAuthenticated,
  Controllers.Users.changePassword,
)

// Request to send email to reset password
router.post('/forgot-password', Controllers.Users.forgotPassword)

// Reset password
router.post('/reset-password', Controllers.Users.resetPassword)

//Register new user
router.post('/signup', Controllers.Users.registerUser)

//Login existing user
router.post('/signin', Controllers.Users.loginUser)

//Logout user
router.post('/signout', isAuthenticated, Controllers.Users.logoutUser)

module.exports = router
