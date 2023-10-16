const mongoose = require('mongoose')

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

module.exports = mongoose.model('FormResponse', formResponseSchema)
