const Models = require('../models')
const { validateForm } = require('../utils/validations')

// Create a new form for a user
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

// Read all forms for a user
module.exports.ReadAll = async (req, res) => {
  try {
    const userID = req.user.userID
    const responses = await Models.FormPage.find({ userID: userID })
    res.status(200).json({ statusCode: 200, responses })
  } catch (err) {
    res.status(500).json({ statusCode: 500, message: 'Internal server error' })
  }
}

// Read a single form for a user
module.exports.Read = async (req, res) => {
  try {
    const form = req.form

    return res.status(200).json(form.stripFor(req.userRole))
  } catch (err) {
    return res
      .status(500)
      .json({ statusCode: 500, message: 'Internal server error' })
  }
}

// Update a form for a user
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

// Share a form with other users
module.exports.Share = async (req, res) => {
  try {
    const form = req.form
    const { sharedWith } = req.body

    // check if the user is not trying to share the form with himself
    if (sharedWith.find((user) => user.user_name === req.user.user_name)) {
      return res
        .status(400)
        .json({ statusCode: 400, message: 'Cannot share form with yourself' })
    }

    // check if the user is not trying to share the form with the same user twice
    const uniqueUserNames = [...new Set(sharedWith.map((user) => user.user_name))]
    if (uniqueUserNames.length !== sharedWith.length) {

      return res.status(400).json({
        statusCode: 400,
        message: 'Cannot share form with the same user twice',
      })
    }

    // find the users with the given user_names
    const users = await Models.Users.find({
      user_name: { $in: sharedWith.map((user) => user.user_name) },
    })
    const validUserNames = users.map((user) => user.user_name)

    const invalidUserNames = sharedWith.filter(
      (user) => !validUserNames.includes(user.user_name),
    )
    if (invalidUserNames.length > 0) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Invalid user_names',
        invalidUserNames,
      })
    }

    const updatedSharedWith = sharedWith.map((user) => ({
      userID: users.find((u) => u.user_name === user.user_name)._id,
      role: user.role,
    }))
    form.sharedWith = updatedSharedWith

    const updatedForm = await form.save()
    res.status(200).json({ statusCode: 200, updatedForm })
  } catch (err) {
    res.status(500).json({ statusCode: 500, message: 'Internal server error' })
  }
}

// Delete a form for a users
module.exports.Delete = async (req, res) => {
  try {
    let form = req.form
    await form.deleteOne()
    res.status(200).json({ message: 'Resource deleted successfully' })
  } catch (err) {
    res.status(500).json({ statusCode: 500, message: 'Internal server error' })
  }
}
