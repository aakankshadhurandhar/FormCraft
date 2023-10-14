// routes/apiRoutes.js
const express = require('express')
const router = express.Router()

const controllers = require('../controllers')
const {
  validateParamAsObjectId,
  fetchFormMiddleware,
} = require('../middlewares')
const handleFileUpload = require('../middlewares/handleFileUpload')

// Create Form
router.post('/forms', controllers.Form.Create)

// Read Form
router.get(
  '/forms/:formId',
  validateParamAsObjectId('formId'),
  fetchFormMiddleware,
  controllers.Form.Read,
)

//Delete Form
router.delete('/forms/:formID', controllers.Form.Delete)
//Update Form
router.patch('/forms/:formID', controllers.Form.Update)

// Submit Form Response
router.post(
  '/forms/:formId/responses',
  validateParamAsObjectId('formId'),
  fetchFormMiddleware,
  handleFileUpload,
  controllers.FormResponse.Create,
)

// Read All Form Responses
router.get(
  '/forms/:formId/responses',
  validateParamAsObjectId('formId'),
  controllers.FormResponse.ReadAll,
)

//Read One Form Response
router.get(
  '/forms/:formId/responses/:responseId',
  validateParamAsObjectId('formId', 'responseId'),
  controllers.FormResponse.Read,
)

module.exports = router
