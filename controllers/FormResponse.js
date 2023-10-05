const Models = require('../models')
const { validateFormResponse } = require('../validators/validations')

module.exports.create = async (req, res) => {
  try {
    const formID = req.params.formId

    const form = await Models.FormPage.findById(formID)
    if (!form) {
      return res.status(404).json({ message: 'Form not found' })
    }
    const { error, value } = validateFormResponse(form, req.body.response)
    if (error) {
      return res.status(400).json({ error })
    }

    const formResponse = new Models.FormResponse({
      form: formID,
      response: value,
    })

    // Save the form response
    const savedResponse = await formResponse.save()

    res.status(201).json(savedResponse)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports.readAll = async (req, res) => {
  try {
    const formID = req.params.formId
    const responses = await Models.FormResponse.find({ form: formID }).exec()
    res.json(responses)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports.read = async (req, res) => {
  try {
    const responseID = req.params.responseId
    const response = await Models.FormResponse.findById(responseID)
    res.json(response)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
