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
    if (
      form.userID.toHexString() === req.user?.userID ||
      form.sharedWith.includes(req.user?.userID)
    ) {
      return res.status(200).json(form)
    }
    if (form.published) {
      return res.status(200).json(form.strip())
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

// Share Form with other users
module.exports.Share = async (req, res) => {
  try {
    const form = req.form
    const { sharedWith } = req.body
    if (!sharedWith) {
      return res.status(400).json({
        statusCode: 400,
        message: 'sharedWith field is required',
      })
    }
    // sharedWith is an array of user_names, check if all the user_names are valid
    // if not, return 400 and the invalid user_names
    // Also make sure that the user is not sharing the form with himself/herself.
    // form.sharedWith will save the associated user._id of the users with whom the form is shared
    const users = await Models.Users.find({ user_name: { $in: sharedWith } })
    const validUserNames = users.map((user) => user.user_name)

    const invalidUserNames = sharedWith.filter(
      (user_name) => !validUserNames.includes(user_name),
    )
    if (invalidUserNames.length > 0) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Invalid user_names',
        invalidUserNames,
      })
    }
    if (sharedWith.includes(req.user.user_name)) {
      return res.status(400).json({
        statusCode: 400,
        message: 'You cannot share the form with yourself',
      })
    }

    form.sharedWith = users.map((user) => user._id)
    const updatedForm = await form.save()
    res.status(200).json({ statusCode: 200, updatedForm })
  } catch (err) {
    throw err
    res
      .status(500)
      .json({ statusCode: 500, message: 'Internal server error', err })
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
