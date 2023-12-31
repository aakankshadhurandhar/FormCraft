// routes/apiRoutes.js
const express = require('express')
const router = express.Router()
const passport = require('passport')
const Controllers = require('../controllers')
const {
  areObjectIDs,
  fetchForm,
  isAuthenticated,
  readJWT,
  checkFormAccess,
  isVerified,
} = require('../middlewares')
const upload = require('../middlewares/upload.js')
const customRedisRateLimiter = require('../middlewares/rateLimiter.js')
router.use(readJWT)

router.get('/', (req, res) => {
  throw new Error('Not Found')
  res.sendResponse('OK')
})

router.post('/forms', isVerified, Controllers.Form.Create)

router.put(
  '/forms/:formID/background',
  checkFormAccess('editor'),
  upload.backgroundImage,
  Controllers.Form.UploadBackground,
)

// Read Form
router.get('/forms/:formID', checkFormAccess('public'), Controllers.Form.Read)

//Read All Forms by a User
router.get('/forms', isVerified, Controllers.Form.ReadAll)

//Delete Form
router.delete(
  '/forms/:formID',
  checkFormAccess('owner'),
  Controllers.Form.Delete,
)

//Update Form
router.put('/forms/:formID', checkFormAccess('editor'), Controllers.Form.Update)

//Share Form
router.put(
  '/forms/:formID/share',
  checkFormAccess('owner'),
  Controllers.Form.Share,
)

// Export Form Responses as CSV
router.get(
  '/forms/:formID/export',
  checkFormAccess('admin'),
  Controllers.FormResponse.ExportAll,
)

// Submit Form Response
router.post(
  '/forms/:formID/responses',
  fetchForm,
  customRedisRateLimiter,
  upload.FormResponse,
  Controllers.FormResponse.Create,
)

// Read All Form Responses
router.get(
  '/forms/:formID/responses',
  checkFormAccess('editor'),
  Controllers.FormResponse.ReadAll,
)

//Read One Form Response
router.get(
  '/forms/:formID/responses/:responseID',
  areObjectIDs('formID', 'responseID'),
  checkFormAccess('editor'),
  Controllers.FormResponse.Read,
)

// Delete Form Response
router.delete(
  '/forms/:formID/responses/:responseID',
  areObjectIDs('responseID'),
  checkFormAccess('admin'),
  Controllers.FormResponse.Delete,
)

// TODO: reconsider the following routes
//  Set Multiple Form Responses Public/Private
// router.put(
//   '/forms/:formID/responses',
//   checkFormAccess('owner'),
//   Controllers.FormResponse.SetPublicMany,
// )
//
// Set Form Response Public/Private
// router.put(
//   '/forms/:formID/responses/:responseID',
//   areObjectIDs('responseID'),
//   checkFormAccess('admin'),
//   Controllers.FormResponse.SetPublicOne,
// )

//Create New User
router.post('/register', Controllers.Users.registerUser)

//Login existing user
router.post('/login', Controllers.Users.loginUser)

//Logout user
router.post('/logout', isAuthenticated, Controllers.Users.logoutUser)

// mount users/index.js router here
router.use('/users', require('./users'))

module.exports = router
