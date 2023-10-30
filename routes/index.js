// routes/apiRoutes.js
const express = require('express')
const router = express.Router()
const passport = require('passport')
const Controllers = require('../controllers')
const {
  areObjectIDs,
  fetchForm,
  handleFileUpload,
  isAuthenticated,
  readJWT,
  formOwnerOnly,
} = require('../middlewares')

router.use(readJWT)

router.get('/', (req, res) => {
  res.json({ message: 'OK!' })
})

// Create Form
router.post('/forms', isAuthenticated, Controllers.Form.Create)

// Read Form
router.get('/forms/:formID', fetchForm, Controllers.Form.Read)

//Read All Forms by a User
router.get('/forms', isAuthenticated, Controllers.Form.ReadAll)

//Delete Form
router.delete('/forms/:formID', formOwnerOnly, Controllers.Form.Delete)

//Update Form
router.put('/forms/:formID', formOwnerOnly, Controllers.Form.Update)

router.get(
  '/forms/:formID/export',
  formOwnerOnly,
  Controllers.FormResponse.ExportAll,
)

// Submit Form Response
router.post(
  '/forms/:formID/responses',
  fetchForm,
  handleFileUpload,
  Controllers.FormResponse.Create,
)


// Read All Form Responses
router.get(
  '/forms/:formID/responses',
  formOwnerOnly,
  Controllers.FormResponse.ReadAll,
)

//  Set Multiple Form Responses Public/Private
router.put(
  '/forms/:formID/responses',
  formOwnerOnly,
  Controllers.FormResponse.SetPublicMany,
)

//Read One Form Response
router.get(
  '/forms/:formID/responses/:responseID',
  areObjectIDs('formID', 'responseID'),
  Controllers.FormResponse.Read,
)

// Set Form Response Public/Private
router.put(
  '/forms/:formID/responses/:responseID',
  areObjectIDs('responseID'),
  fetchForm,
  Controllers.FormResponse.SetPublicOne,
)

// Delete Form Response
router.delete(
  '/forms/:formID/responses/:responseID',
  areObjectIDs('responseID'),
  formOwnerOnly,
  Controllers.FormResponse.Delete,
)

//Create New User
router.post('/register', Controllers.Users.registerUser)

//Login existing user
router.post('/login', Controllers.Users.loginUser)

module.exports = router
