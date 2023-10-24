// routes/apiRoutes.js
const express = require('express')
const router = express.Router()

const controllers = require('../controllers')
const {
  validateParamAsObjectId,
  fetchForm,
  handleFileUpload,
  validateToken,
} = require('../middlewares')

// Create Form
router.post('/forms', controllers.Form.Create)

// Read Form
router.get(
  '/forms/:formID',
  validateToken,
  validateParamAsObjectId('formID'),
  fetchForm,
  controllers.Form.Read,
)

//Delete Form
router.delete('/forms/:formID', fetchForm, controllers.Form.Delete)
//Update Form
router.put('/forms/:formID', fetchForm, controllers.Form.Update)

// Submit Form Response
router.post(
  '/forms/:formID/responses',
  fetchForm,
  handleFileUpload,
  controllers.FormResponse.Create,
)

// Read All Form Responses
router.get(
  '/forms/:formID/responses',
  validateParamAsObjectId('formID'),
  controllers.FormResponse.ReadAll,
)

//Read One Form Response
router.get(
  '/forms/:formID/responses/:responseId',
  validateParamAsObjectId('formID', 'responseId'),
  controllers.FormResponse.Read,
)

//Create New User
router.post('/register', controllers.Users.registerUser)

//Login existing user
router.post('/login', controllers.Users.loginUser)

module.exports = router
