// routes/apiRoutes.js
const express = require('express')
const router = express.Router()

const controllers = require('../controllers')
const {
  validateParamAsObjectId,
  fetchForm,
  handleFileUpload,
} = require('../middlewares')

// Create Form
router.post('/forms', controllers.Form.Create)

// Read Form
router.get(
  '/forms/:formID',
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

router.get(
  '/forms/:formID/export',
  fetchForm,
  controllers.FormResponse.ExportAll,
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

// Delete Form Response
router.delete(
  '/forms/:formID/responses/:responseId',
  validateParamAsObjectId('formID', 'responseId'),
  controllers.FormResponse.Delete,
)
module.exports = router
