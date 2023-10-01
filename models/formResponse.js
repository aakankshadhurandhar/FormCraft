const mongoose = require('mongoose');

const formResponseSchema = new mongoose.Schema({
  form: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form',
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  // Response data as an object (map-like)
  response: {
    type: Object,
    _id: false,
    default: {},
  },
});

module.exports = mongoose.model('FormResponse', formResponseSchema);