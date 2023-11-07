const { default: mongoose } = require('mongoose')
const { UploadToS3 } = require('../services/S3')
const { validateFormResponse } = require('../utils/validations')
const Models = require('../models')
const createExportFile = require('../utils/createExportFile')

module.exports.Create = async (req, res) => {
  try {
    const { form, files } = req

    if (form.expiry && form.expiry < Date.now()) {
      return res.status(400).json({ message: 'Form has expired' })
    }
    if (!form.published) {
      return res.status(400).json({ message: 'Form is not public' })
    }

    const responseID = new mongoose.Types.ObjectId().toHexString()
    let formValues = req.body

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
      return res.status(400).json({ error })
    }

    UploadToS3(files)
    const formResponse = new Models.FormResponse({
      _id: responseID,
      formID: form._id,
      response: value,
    })
    const savedResponse = await formResponse.save()
    res.status(201).json(savedResponse)
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports.ReadAll = async (req, res) => {
  try {
    const formID = req.params.formID
    const responses = await Models.FormResponse.find({
      formID: formID,
    }).exec()
    res.json(responses)
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports.Read = async (req, res) => {
  try {
    const form = req.form
    const responseID = req.params.responseID
    const response = await Models.FormResponse.findById(responseID)
    if (!response || response.formID != form._id) {
      return res.status(404).json({ message: 'Response not found' })
    }
    res.json(response)
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports.Delete = async (req, res) => {
  try {
    const responseID = req.params.responseID
    const response = await Models.FormResponse.findById(responseID)
    await response.deleteOne()
    res.json({ message: 'Form response deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports.ExportAll = async (req, res) => {
  try {
    const type = req.query.type || 'xlsx'
    if (type != 'xlsx' && type != 'csv') {
      return res.status(400).json({ message: 'Unsupported export type' })
    }

    const form = req.form
    const formResponses = await Models.FormResponse.find({
      formID: form._id,
    }).exec()

    const fileBuffer = await createExportFile(form, formResponses, type)

    res.set('Content-Type', 'application/octet-stream')
    res.set(
      'Content-Disposition',
      `attachment; filename=${form.title}-${Date.now()}.${type}`,
    )
    res.send(fileBuffer)
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports.SetPublicOne = async (req, res) => {
  try {
    const responseID = req.params.responseID
    const publicStatus = req.body.public || true
    if (typeof publicStatus != 'boolean') {
      return res.status(400).json({ message: 'Invalid public status' })
    }
    const response = await Models.FormResponse.findById(responseID)
    if (!response) {
      return res.status(404).json({ message: 'Response not found' })
    }
    response.public = publicStatus
    await response.save()
    if (response.public) {
      return res.json({ message: 'Response is now public' })
    }
    return res.json({ message: 'Response is now private' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports.SetPublicMany = async (req, res) => {
  try {
    const responseIDs = req.body.responseIDs
    if (!Array.isArray(responseIDs)) {
      return res.status(400).json({ message: 'Invalid response IDs' })
    }
    const publicStatus = req.body.public || true
    if (typeof publicStatus != 'boolean') {
      return res.status(400).json({ message: 'Invalid public status' })
    }

    const response = await Models.FormResponse.updateMany(
      { _id: { $in: responseIDs } },
      { public: publicStatus },
    )
    res.json({ message: 'Responses are now public' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}