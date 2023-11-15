const mongoose = require('mongoose')
const { DeleteFilesFromS3: DeleteFilesFromS3 } = require('../services/S3')

/**
 * Mongoose schema for form responses.
 * @typedef {Object} FormResponseSchema
 * @property {mongoose.Schema.Types.ObjectId} formID - The ID of the form that the response belongs to.
 * @property {Object} response - The response object.
 * @property {boolean} response._id - Set to false to exclude the _id field from the response object.
 * @property {Date} createdAt - The timestamp when the response was created.
 * @property {Date} updatedAt - The timestamp when the response was last updated.
 */
const formResponseSchema = new mongoose.Schema(
  {
    form: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Form',
      required: true,
    },
    public: {
      type: Boolean,
      default: false,
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

formResponseSchema.virtual('files').get(function () {
  const response = this.response
  return Object.entries(response).flatMap(([key, value]) => {
    if (Array.isArray(value)) {
      return value.filter((element) => element.path)
    }
    return []
  })
})

/**
 * Middleware to delete all files uploaded as part of a response when the response is deleted
 */
formResponseSchema.pre(
  'deleteOne',
  { document: true, query: true },
  async function (next) {
    await DeleteFilesFromS3(this.files)
    next()
  },
)

module.exports = mongoose.model('FormResponse', formResponseSchema)
