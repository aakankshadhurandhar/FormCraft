const Models = require('../models')
const { validateForm } = require('../validators/validations')


module.exports.create = async (req, res) => {
  try {
    const { error, value } = validateForm(req.body)

    if (error) {
      // If validation fails, return a 400 Bad Request response with the validation error details

      return res.status(400).json({
        statusCode: 400,
        message: error.details.map((detail) => detail.message),
        error
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
    res.json(req.form)
  } catch (err) {
    console.error(err);
    res.status(500).json({ statusCode: 500,message: "Internal server error" });
  }
}
