// routes/apiRoutes.js
const express = require('express')
const router = express.Router()
const passport = require('passport')
const Controllers = require('../controllers')
const { areObjectIDs, fetchForm, handleFileUpload } = require('../middlewares')
const isJWTVerify = require('../middlewares/isJWTVerify')
const isAuthorized = require('../middlewares/isAuthorized')

router.get('/', (req, res) => {
  res.json({ message: 'OK!' })
})

// Create Form
router.post('/forms', Controllers.Form.Create)

// Read Form
router.get('/forms/:formID', isJWTVerify, fetchForm, Controllers.Form.Read)
//Read All Forms by a User
router.get('/forms', isJWTVerify, Controllers.Form.ReadAll)
//Delete Form
router.delete(
  '/forms/:formID',
  isJWTVerify,
  fetchForm,
  isAuthorized,
  Controllers.Form.Delete,
)

//Update Form
router.put(
  '/forms/:formID',
  isJWTVerify,
  fetchForm,
  isAuthorized,
  Controllers.Form.Update,
)

// Submit Form Response
router.post(
  '/forms/:formID/responses',
  fetchForm,
  handleFileUpload,
  Controllers.FormResponse.Create,
)

router.get(
  '/forms/:formID/export',
  fetchForm,
  Controllers.FormResponse.ExportAll,
)

// Read All Form Responses
router.get(
  '/forms/:formID/responses',
  areObjectIDs('formID'),
  Controllers.FormResponse.ReadAll,
)

//Read One Form Response
router.get(
  '/forms/:formID/responses/:responseID',
  areObjectIDs('formID', 'responseID'),
  Controllers.FormResponse.Read,
)

// Delete Form Response
router.delete(
  '/forms/:formID/responses/:responseID',
  areObjectIDs('formID', 'responseID'),
  Controllers.FormResponse.Delete,
)
//Create New User
router.post('/register', Controllers.Users.registerUser)

//Login existing user
router.post('/login', Controllers.Users.loginUser)

module.exports = router
