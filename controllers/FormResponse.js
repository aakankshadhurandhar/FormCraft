const Models = require('../models')
const { validateFormResponse } = require('../validators/validations')

module.exports.Create = async (req, res) => {
  try {
    const { form, files } = req
    let formValues = req.body
    if (req.files) {
      for (const file of files) {
        const { fieldname } = file
        const fileDetails = {
          filename: file.originalname,
          path: file.path,
          sizeInKB: file.size / 1000,
        }
        if (formValues[fieldname] == undefined) {
          formValues[fieldname] = []
        }
        formValues[fieldname].push(fileDetails)
      }
    }

    let { error, value } = validateFormResponse(form, formValues)
    if (error) {
      return res.status(400).json({ error })
    }

    const formResponse = new Models.FormResponse({
      formID: form._id,
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

module.exports.ReadAll = async (req, res) => {
  try {
    const formID = req.params.formID
    const responses = await Models.FormResponse.find({ formID: formID }).exec()
    res.json(responses)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports.Read = async (req, res) => {
  try {
    const responseID = req.params.responseId
    const response = await Models.FormResponse.findById(responseID)
    res.json(response)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
