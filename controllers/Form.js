const Models = require('../models')
const { validateForm } = require('../validators/validations')

module.exports.create = async (req, res) => {
  try {
    const { error, value } = validateForm(req.body)

    if (error) {
      // If validation fails, return a 400 Bad Request response with the validation error details
      return res
        .status(400)
        .json({
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
    console.error(err)
    res.status(500).json({ statusCode: 500, message: 'Internal server error' })
  }
}

module.exports.read = async (req, res) => {
  try {
    const formID = req.params.formID
    const form = await Models.FormPage.findById(formID)

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
