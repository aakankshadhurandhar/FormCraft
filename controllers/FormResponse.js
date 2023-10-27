const { default: mongoose } = require('mongoose')
const Models = require('../models')
const { UploadToS3 } = require('../services/S3')
const { validateFormResponse } = require('../validators/validations')
const createExportFile = require('../utils/createExportFile')

/**
 * Creates a new form response.
 * @param {Object} req - The request object.
 * @param {Object} req.body - The form response data.
 * @param {Object} req.form - The form object.
 * @param {Array} req.files - The uploaded files.
 * @param {Object} res - The response object.
 * @returns {Object} The saved form response.
 */
module.exports.Create = async (req, res) => {
  try {
    const { form, files } = req
    const responseID = new mongoose.Types.ObjectId().toHexString()
    let formValues = req.body

    for (let i = 0; i < files.length; i++) {
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
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
}

/**
 * Retrieves all form responses for a given form.
 * @param {Object} req - The request object.
 * @param {string} req.params.formID - The ID of the form.
 * @param {Object} res - The response object.
 * @returns {Array} The form responses for the given form.
 */
module.exports.ReadAll = async (req, res) => {
  try {
    const formID = req.params.formID
    const responses = await Models.FormResponse.find({ formID: formID }).exec()
    res.json(responses)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

/**
 * Retrieves a single form response by ID.
 * @param {Object} req - The request object.
 * @param {string} req.params.responseId - The ID of the form response.
 * @param {Object} res - The response object.
 * @returns {Object} The form response with the given ID.
 */
module.exports.Read = async (req, res) => {
  try {
    const responseID = req.params.responseId
    const response = await Models.FormResponse.findById(responseID)
    res.json(response)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

/**
 * Deletes a form response by ID.
 * @param {Object} req - The request object.
 * @param {string} req.params.responseId - The ID of the form response.
 * @param {Object} res - The response object.
 * @returns {Object} A success message.
 */
module.exports.Delete = async (req, res) => {
  try {
    const responseID = req.params.responseId
    const response = await Models.FormResponse.findById(responseID)
    await response.deleteOne()
    res.json({ message: 'Form response deleted successfully' })
  } catch (error) {
    console.error(error)
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
    res.set('Content-Disposition', `attachment; filename=${form.title}-${Date.now()}.${type}`)
    res.send(fileBuffer) 

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
