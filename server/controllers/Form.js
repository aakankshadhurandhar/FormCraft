const Models = require('../models')
const { UploadToS3, DeleteFilesFromS3 } = require('../services/S3')
const { validateForm } = require('../utils/validations')
const redis = require('../services/redis')

// Create a new form for a user
module.exports.Create = async (req, res) => {
  try {
    const { error, value } = validateForm(req.body)

    const userID = req.user.id
    if (error) {
      return res.status(400).json({
        statusCode: 400,
        message: error.details.map((detail) => detail.message),
        error,
      })
    }

    const form = new Models.FormPage({
      owner: userID,
      ...value,
    })

    const savedForm = await form.save()
    // save in redis
    redis.setex(savedForm._id,600,JSON.stringify(savedForm))
    res.status(201).json({ statusCode: 201, savedForm })
  } catch (err) {
    console.log(err)
    res.status(500).json({ statusCode: 500, message: 'Internal server error' })
  }
}

// Read all forms for a user
module.exports.ReadAll = async (req, res) => {
  try {
    const userID = req.user.id
    const responses = await Models.FormPage.find({ owner: userID })
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
    console.log(err)
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
    redis.setEX(updatedForm._id,JSON.stringify(updatedForm),'EX',600)
    res.json({
      statusCode: 200,
      message: 'Form updated successfully',
      updatedForm,
    })
  } catch (err) {
    res.status(500).json({ statusCode: 500, message: 'Internal server error' })
  }
}

// Upload a "background" image for a form
module.exports.UploadBackground = async (req, res) => {
  try {
    const form = req.form
    const file = req.file

    if (!file) {
      return res.status(400).json({ statusCode: 400, message: 'No file found' })
    }

    if (form.background) {
      DeleteFilesFromS3([{ path: form.background }])
    }

    file.key = `/background/${form._id}/${file.filename}`
    UploadToS3([file])
    form.background =
      'https://formcraft-responses.s3.ap-south-1.amazonaws.com/' + file.key
    const updatedForm = await form.save()
    redis.setEX(updatedForm._id,JSON.stringify(updatedForm),'EX',600)
    res.status(200).json({ statusCode: 200, updatedForm })
  } catch (err) {
    console.log(err)
    res.status(500).json({ statusCode: 500, message: 'Internal server error' })
  }
}

// Share a form with other users
module.exports.Share = async (req, res) => {
  try {
    const form = req.form
    const { sharedWith } = req.body

    // check if the user is not trying to share the form with himself
    if (sharedWith.find((user) => user.username === req.user.username)) {
      return res
        .status(400)
        .json({ statusCode: 400, message: 'Cannot share form with yourself' })
    }

    // check if the user is not trying to share the form with the same user twice
    const uniqueUserNames = [
      ...new Set(sharedWith.map((user) => user.username)),
    ]
    if (uniqueUserNames.length !== sharedWith.length) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Cannot share form with the same user twice',
      })
    }

    // find the users with the given usernames
    const users = await Models.Users.find({
      username: { $in: sharedWith.map((user) => user.username) },
    })
    const validUserNames = users.map((user) => user.username)

    const invalidUserNames = sharedWith.filter(
      (user) => !validUserNames.includes(user.username),
    )
    if (invalidUserNames.length > 0) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Invalid usernames',
        invalidUserNames,
      })
    }

    const updatedSharedWith = sharedWith.map((user) => ({
      user: users.find((u) => u.username === user.username)._id,
      role: user.role,
    }))
    form.sharedWith = updatedSharedWith

    const updatedForm = await form.save()
    redis.setEX(updatedForm._id,JSON.stringify(updatedForm),'EX',600)
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
    redis.del(form._id)
    res.status(200).json({ message: 'Resource deleted successfully' })
  } catch (err) {
    res.status(500).json({ statusCode: 500, message: 'Internal server error' })
  }
}
