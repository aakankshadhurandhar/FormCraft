const Models = require('../models')
const { validateForm } = require('../utils/validations')

module.exports.Create = async (req, res) => {
  try {
    const { error, value } = validateForm(req.body)

    const userID = req.user.userID
    if (error) {
      return res.status(400).json({
        statusCode: 400,
        message: error.details.map((detail) => detail.message),
        error,
      })
    }

    const form = new Models.FormPage({
      userID,
      ...value,
    })

    const savedForm = await form.save()
    res.status(201).json({ statusCode: 201, savedForm })
  } catch (err) {
    res.status(500).json({ statusCode: 500, message: 'Internal server error' })
  }
}

module.exports.ReadAll = async (req, res) => {
  try {
    const userID = req.user.userID
    const responses = await Models.FormPage.find({ userID: userID })
    res.status(200).json({ statusCode: 200, responses })
  } catch (err) {
    console.log(err)
    res.status(500).json({ statusCode: 500, message: 'Internal server error' })
  }
}

/**
 * Reads the form data and returns the form object if it is published or if the form userID matches the userID of the logged-in user.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - The form object without the userID field, or a JSON object with a "message" field set to "Unauthorized" if the conditions are not met.
 */
module.exports.Read = async (req, res) => {
  try {
    const form = req.form

    if (form.published || form.userID.toHexString() === req.user?.userID) {
      const formWithoutUserID = { ...form.toObject() }
      delete formWithoutUserID.userID
      return res.status(200).json(formWithoutUserID)
    }

    return res.status(401).json({ message: 'Unauthorized' })
  } catch (err) {
    return res
      .status(500)
      .json({ statusCode: 500, message: 'Internal server error', err })
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

    const { title, description, inputs, expiry, published } = value

    existingForm.title = title
    existingForm.description = description
    existingForm.inputs = inputs
    existingForm.expiry = expiry
    existingForm.published = published

    const updatedForm = await existingForm.save()
    res.json({
      statusCode: 200,
      message: 'Form updated successfully',
      updatedForm,
    })
  } catch (err) {
    res.status(500).json({ statusCode: 500, message: 'Internal server error' })
  }
}

module.exports.Delete = async (req, res) => {
  try {
    let form = req.form
    await form.deleteOne()
    res.status(200).json({ message: 'Resource deleted successfully' })
  } catch (err) {
    res.status(500).json({ statusCode: 500, message: 'Internal server error' })
  }
}
