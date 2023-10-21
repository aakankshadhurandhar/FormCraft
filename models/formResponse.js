const mongoose = require('mongoose')
const { DeleteFilesFromS3 } = require('../services/S3')

const formResponseSchema = new mongoose.Schema(
  {
    formID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Form',
      required: true,
    },
    // Response data as an object (map-like)
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

// Delete all uploaded files when a form response is deleted
formResponseSchema.pre(
  'deleteOne',
  { document: true, query: true },
  async function (next) {
    deleteFileForResponse(this.response)
    next()
  },
)

module.exports = mongoose.model('FormResponse', formResponseSchema)

const getFilesFromResponse = (response) => {
  return Object.entries(response).flatMap(([key, value]) => {
    if (Array.isArray(value)) {
      return value.filter((element) => element.path)
    }
    return []
  })
}

const deleteFileForResponse = async (response) => {
  const files = getFilesFromResponse(response)
  await DeleteFilesFromS3(files)
}
