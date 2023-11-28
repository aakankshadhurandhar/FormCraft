const Controllers = require('../../controllers')
const router = require('express').Router()
const { isAuthenticated } = require('../../middlewares')

router.get('/verify', Controllers.Users.verifyUser)

router.post(
  '/verify',
  isAuthenticated,
  Controllers.Users.verificationEmailRequest,
)

router.post(
  '/change-password',
  isAuthenticated,
  Controllers.Users.changePassword,
)

router.post('/forgot-password', Controllers.Users.forgotPassword)

router.post('/reset-password', Controllers.Users.resetPassword)

router.post('/signup', Controllers.Users.registerUser)

//Login existing user
router.post('/signin', Controllers.Users.loginUser)

//Logout user
router.post('/signout', isAuthenticated, Controllers.Users.logoutUser)

module.exports = router
