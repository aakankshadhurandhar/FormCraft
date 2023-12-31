const { default: mongoose } = require('mongoose')
const { UploadToS3 } = require('../services/S3')
const { validateFormResponse } = require('../utils/validations')
const Models = require('../models')
const createExportFile = require('../utils/createExportFile')

// Submit a response to a form
module.exports.Create = async (req, res) => {
  try {
    const { form, files } = req

    // if form is not published or expired, return error
    if (form.expiry && form.expiry < Date.now()) {
      return res.sendBadRequest('Form has expired')
    }
    if (!form.published) {
      return res.sendBadRequest('Form is not published')
    }

    const responseID = new mongoose.Types.ObjectId().toHexString()
    let formValues = req.body

    // Add a key to each file object for S3
    for (let i = 0; i < files?.length; i++) {
      files[i].key = files[i].path.replace(
        'uploads',
        `uploads/${form._id}/${responseID}`,
      )
      const { fieldname, originalname, key, size } = files[i]

      const fileDetails = {
        filename: originalname,
        path: 'https://formcraft-responses.s3.ap-south-1.amazonaws.com/' + key,
        sizeInKB: size / 1000,
      }

      if (formValues[fieldname] == undefined) {
        formValues[fieldname] = []
      }
      formValues[fieldname].push(fileDetails)
    }

    let { error, value } = validateFormResponse(form, formValues)
    if (error) {
      return res.sendBadRequest('Form Response validation failed', error)
    }

    // Upload files to S3 in background
    UploadToS3(files)

    const formResponse = new Models.FormResponse({
      _id: responseID,
      form: form._id,
      response: value,
    })
    const savedResponse = await formResponse.save()
    return res.sendResponse('Form response Submitted', savedResponse, 201)
  } catch (err) {
    return res.sendInternalServerError(err)
  }
}

// Read all responses to a form
module.exports.ReadAll = async (req, res) => {
  try {
    const formID = req.params.formID
    const responses = await Models.FormResponse.find({
      form: formID,
    }).exec()
    return res.sendSuccess('Form responses', responses)
  } catch (error) {
    return res.sendInternalServerError(error)
  }
}

// Read a single response to a form
module.exports.Read = async (req, res) => {
  try {
    const form = req.form
    const responseID = req.params.responseID
    const response = await Models.FormResponse.findById(responseID)

    if (!response || response.form != form._id) {
      return res.sendNotFound('Response not found')
    }

    return res.sendSuccess('Form response', response)
  } catch (error) {
    return res.sendInternalServerError(error)
  }
}

// Update a response to a form
module.exports.Delete = async (req, res) => {
  try {
    const responseID = req.params.responseID
    const response = await Models.FormResponse.findById(responseID)
    await response.deleteOne()
    return res.sendResponse('Form response deleted successfully')
  } catch (error) {
    return res.sendInternalServerError(error)
  }
}

// Update a response to a form
module.exports.ExportAll = async (req, res) => {
  try {
    const type = req.query.type || 'xlsx'
    if (type != 'xlsx' && type != 'csv') {
      return res.sendBadRequest('Unsupported export type')
    }

    const form = req.form
    const formResponses = await Models.FormResponse.find({
      form: form._id,
    }).exec()

    const fileBuffer = await createExportFile(form, formResponses, type)

    res.set('Content-Type', 'application/octet-stream')
    res.set(
      'Content-Disposition',
      `attachment; filename=${form.title}-${Date.now()}.${type}`,
    )
    res.send(fileBuffer)
  } catch (error) {
    return res.sendInternalServerError(error)
  }
}

// Set a response to public or private
module.exports.SetPublicOne = async (req, res) => {
  try {
    const responseID = req.params.responseID
    let publicStatus = req.body.public || true
    publicStatus = publicStatus === 'true' ? true : false

    const response = await Models.FormResponse.findById(responseID)
    if (!response) {
      return res.sendNotFound('Response not found')
    }
    response.public = publicStatus
    await response.save()
    if (response.public) {
      return sendSuccess('Response is now public')
    }
    return sendSuccess('Response is now private')
  } catch (error) {
    return res.sendInternalServerError(error)
  }
}

// Set many responses to public or private
module.exports.SetPublicMany = async (req, res) => {
  try {
    const responseIDs = req.body.responseIDs
    if (!Array.isArray(responseIDs)) {
      return res.status(400).json({ message: 'Invalid response IDs' })
    }
    let publicStatus = req.body.public || true
    publicStatus = publicStatus === 'true' ? true : false

    const response = await Models.FormResponse.updateMany(
      { _id: { $in: responseIDs } },
      { public: publicStatus },
    )
    return sendSuccess('Responses are now public')
  } catch (error) {
    return res.sendInternalServerError(error)
  }
}
