// routes/apiRoutes.js
const express = require('express')
const router = express.Router()

const controllers = require('../controllers')
const { validateParamAsObjectId, fetchFormMiddleware } = require('../middlewares')
const handleFileUpload = require('../middlewares/handleFileUpload');


// Create Form
router.post('/forms', controllers.Form.create)

// Read Form
router.get(
  '/forms/:formId',
  validateParamAsObjectId('formId'),fetchFormMiddleware,
  controllers.Form.read,
)

//Delete Form
router.delete('/forms/:formID', controllers.Form.delete)
//Update Form
router.put('/forms/:formID', controllers.Form.update)
// Submit Form Response
router.post(
  '/forms/:formId/responses',
  validateParamAsObjectId('formId'),fetchFormMiddleware,handleFileUpload,
  controllers.FormResponse.create,
)

// Read All Form Responses
router.get(
  '/forms/:formId/responses',
  validateParamAsObjectId('formId'),
  controllers.FormResponse.readAll,
)

//Read One Form Response
router.get(
  '/forms/:formId/responses/:responseId',
  validateParamAsObjectId('formId', 'responseId'),
  controllers.FormResponse.read,
)


module.exports = router
