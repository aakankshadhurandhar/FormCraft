const Models = require('../models')
const { validateForm } = require('../validators/validations')

module.exports.Create = async (req, res) => {
  try {
    const { error, value } = validateForm(req.body)

    if (error) {
      return res.status(400).json({
        statusCode: 400,
        message: error.details.map((detail) => detail.message),
        error,
      })
    }
    const { title, description, inputs } = value
    const form = new Models.FormPage({
      title,
      description,
      inputs,
    })

    const savedForm = await form.save()
    res.status(201).json({ statusCode: 201, savedForm })
  } catch (err) {
    res.status(500).json({ statusCode: 500, message: 'Internal server error' })
  }
}

module.exports.Read = async (req, res) => {
  try {
    const form = req.form
    res.status(200).json(form)
  } catch (err) {
    console.error(err)
    res.status(500).json({ statusCode: 500, message: 'Internal server error' })
  }
}

module.exports.Update = async (req, res) => {
  try {
    const { error, value } = validateForm(req.body)

    if (error) {
      return res.status(400).json({
        statusCode: 400,
        message: error.details.map((detail) => detail.message),
        error,
      })
    }
    const existingForm = req.form

    const { title, description, inputs } = value
    existingForm.title = title
    existingForm.description = description
    existingForm.inputs = inputs

    const updatedForm = await existingForm.save()
    res.json({
      statusCode: 200,
      message: 'Form updated successfully',
      updatedForm,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ statusCode: 500, message: 'Internal server error' })
  }
}

module.exports.Delete = async (req, res) => {
  try {
    let form = req.form
    form = await form.deleteOne()
    Models.FormResponse.deleteMany({ formID: form._id })
    res.status(200).json({ message: 'Resource deleted successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ statusCode: 500, message: 'Internal server error' })
  }
}
