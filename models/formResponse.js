const mongoose = require('mongoose')
const { DeleteFilesFromS3 } = require('../services/S3')

/**
 * @typedef {Object} FormResponse
 * @property {mongoose.Schema.Types.ObjectId} formID - The ID of the form that this response belongs to
 * @property {Object} response - Response data as an object (map-like)
 * @property {Date} createdAt - The date when this response was created
 * @property {Date} updatedAt - The date when this response was last updated
 */

const formResponseSchema = new mongoose.Schema(
  {
    formID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Form',
      required: true,
    },
    response: {
      type: Object,
      _id: false,
      default: {},
    },
  },
  {
    timestamps: true,
  },
)

/**
 * Deletes all uploaded files when a form response is deleted
 * @param {Object} response - The response object to delete files for
 * @returns {Promise<void>}
 */
const deleteFileForResponse = async (response) => {
  const files = getFilesFromResponse(response)
  await DeleteFilesFromS3(files)
}

/**
 * Returns an array of all files uploaded as part of a response
 * @param {Object} response - The response object to get files from
 * @returns {Array} - An array of files uploaded as part of the response
 */
const getFilesFromResponse = (response) => {
  return Object.entries(response).flatMap(([key, value]) => {
    if (Array.isArray(value)) {
      return value.filter((element) => element.path)
    }
    return []
  })
}

/**
 * Middleware to delete all files uploaded as part of a response when the response is deleted
 */
formResponseSchema.pre(
  'deleteOne',
  { document: true, query: true },
  async function (next) {
    deleteFileForResponse(this.response)
    next()
  },
)

module.exports = mongoose.model('FormResponse', formResponseSchema)
