const Models = require('../models')
const {
  validateForm,
  validateUpdateForm,
} = require('../validators/validations')

module.exports.create = async (req, res) => {
  try {
    const { error, value } = validateForm(req.body)

    if (error) {
      // If validation fails, return a 400 Bad Request response with the validation error details

      return res.status(400).json({
        statusCode: 400,
        message: error.details.map((detail) => detail.message),
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

module.exports.read = async (req, res) => {
  try {
    const formID = req.params.formId
    const form = await Models.FormPage.findById(formID)
    console.log(formID)
    if (!form) {
      return res
        .status(404)
        .json({ statusCode: 404, message: 'Form not found' })
    }

    res.status(200).json(form)
  } catch (err) {
    console.error(err)
    res.status(500).json({ statusCode: 500, message: 'Internal server error' })
  }
}
module.exports.update = async (req, res) => {
  const formID = req.params.formID
  const updatedFormData = req.body
  try {
    const { error } = validateUpdateForm(updatedFormData)

    if (error) {
      // If validation fails, return a 400 Bad Request response with the validation error details

      return res.status(400).json({
        statusCode: 400,
        message: error.details.map((detail) => detail.message),
      })
    }
    const form = await Models.FormPage.findByIdAndUpdate(
      formID,
      updatedFormData,
      { new: true },
    )
  
    if (!form) {
      return res.status(404).json({ error: 'Form not found' })
    }

    res.json({ statusCode: 200, message: 'Form updated successfully', form })
  } catch (err) {
    console.error(err)
    res.status(500).json({ statusCode: 500, message: 'Internal server error' })
  }
}
module.exports.delete = async (req, res) => {
  try {
    const formID = req.params.formID
    const deletedForm = await Models.FormPage.findByIdAndRemove(formID)
    if (!deletedForm) {
      return res.status(404).json({ message: 'Resource not found' })
    }
    res.json({ message: 'Resource deleted successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ statusCode: 500, message: 'Internal server error' })
  }
}
