// routes/apiRoutes.js
const express = require('express')
const router = express.Router()

const controllers = require('../controllers')

// Create Form
router.post('/forms', controllers.Form.create)

// Read Form
router.get('/forms/:formID', controllers.Form.read)

//Delete Form
router.delete('/forms/:formID', controllers.Form.delete)
//Update Form
router.put('/forms/:formID', controllers.Form.update)
// Submit Form Response
router.post('/forms/:formID/responses', controllers.FormResponse.create)

// Read All Form Responses
router.get('/forms/:formID/responses', controllers.FormResponse.readAll)

//Read One Form Response
router.get(
  '/forms/:formId/responses/:responseID',
  controllers.FormResponse.read,
)

module.exports = router
