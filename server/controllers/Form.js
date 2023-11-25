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
      return res.sendBadRequest('Form validation failed', error)
    }

    const form = new Models.FormPage({
      owner: userID,
      ...value,
    })

    const savedForm = await form.save()
    // save in redis
    redis.setex(savedForm._id, 600, JSON.stringify(savedForm))
    return res.sendResponse('Form created successfully', savedForm, 201)
  } catch (err) {
    res.sendInternalServerError(err)
  }
}

// Read all forms for a user
module.exports.ReadAll = async (req, res) => {
  try {
    const userID = req.user.id
    const myForms = await Models.FormPage.find({ owner: userID })
      .populate('owner', 'username _id')
      .populate('sharedWith.user', 'username _id')
    const sharedForms = await Models.FormPage.find({
      'sharedWith.user': userID,
    })
      .populate('owner', 'username _id')
      .populate('sharedWith.user', 'username _id')

    return res.sendSuccess({ myForms, sharedForms })
  } catch (err) {
    return res.sendInternalServerError(err)
  }
}

// Read a single form for a user
module.exports.Read = async (req, res) => {
  try {
    const form = req.form

    return res.sendSuccess(form.stripFor(req.userRole))
  } catch (err) {
    return res.sendInternalServerError(err)
  }
}

//TODO: error coming from here
// Update a form for a user
module.exports.Update = async (req, res) => {
  try {
    const { error, value } = validateForm(req.body)

    if (error) {
      return res.sendBadRequest('Form validation failed', error)
    }

    const { title, description, inputs, expiry, published } = value

    const updatedForm = await Models.FormPage.findByIdAndUpdate(
      req.form._id,
      { title, description, inputs, expiry, published },
      { new: true },
    )
    await updatedForm.populate('owner', 'username _id')
    await updatedForm.populate('sharedWith.user', 'username _id')
    redis.setex(updatedForm._id, 600, JSON.stringify(updatedForm.toObject()))

    return res.sendSuccess(updatedForm.stripFor(req.userRole))
  } catch (err) {
    return res.sendInternalServerError(err)
  }
}

// Upload a "background" image for a form
module.exports.UploadBackground = async (req, res) => {
  try {
    const form = req.form
    const file = req.file

    if (!file) {
      return res.sendBadRequest('No file found')
    }

    if (form.background) {
      DeleteFilesFromS3([{ path: form.background }])
    }

    file.key = `/background/${form._id}/${file.filename}`
    UploadToS3([file])
    form.background =
      'https://formcraft-responses.s3.ap-south-1.amazonaws.com/' + file.key
    const updatedForm = await form.save()
    redis.setEX(updatedForm._id, JSON.stringify(updatedForm), 'EX', 600)
    return res.sendSuccess(updatedForm)
  } catch (err) {
    return res.sendInternalServerError(err)
  }
}

// Share a form with other users
module.exports.Share = async (req, res) => {
  try {
    const form = req.form
    const { sharedWith } = req.body

    // Create a set of unique usernames
    const usernames = [...new Set(sharedWith.map((user) => user.username))]
    const roles = sharedWith.map((user) => user.role)

    // Check if the user is not trying to share the form with himself
    if (usernames.includes(req.user.username)) {
      return res.sendBadRequest('Cannot share form with yourself')
    }

    const users = await Models.Users.find(
      { username: { $in: usernames } },
      '_id username',
    )

    if (users.length !== usernames.length) {
      return res.sendBadRequest('Invalid usernames')
    }
    const userMap = users.reduce((map, user) => {
      map[user.username] = user
      return map
    }, {})

    form.sharedWith = usernames.map((username, index) => ({
      user: userMap[username],
      role: roles[index],
    }))

    const updatedForm = await form.save()
    return res.sendSuccess(updatedForm)
  } catch (err) {
    return res.sendInternalServerError(err)
  }
}

// Delete a form for a users
module.exports.Delete = async (req, res) => {
  try {
    let form = req.form
    await form.deleteOne()
    redis.del(form._id)
    return res.sendSuccess({ message: 'Form deleted successfully' })
  } catch (err) {
    return res.sendInternalServerError(err)
  }
}
