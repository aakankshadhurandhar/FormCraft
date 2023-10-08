const mongoose = require('mongoose')

// Form inputs Schema
const formInputSchema = new mongoose.Schema({
  _id: false,
  type: {
    type: String,
    enum: [
      'small-text',
      'long-text',
      'number',
      'email',
      'multi-select',
      'radio',
      'file',
    ],
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  minLength: {
    type: Number,
    required: function () {
      return this.type === 'small-text' && this.minLength !== undefined
    },
  },
  maxLength: {
    type: Number,
    required: function () {
      return (
        (this.type === 'small-text' || this.type === 'long-text') &&
        this.maxLength !== undefined
      )
    },
  },
  minValue: {
    type: Number,
    required: function () {
      return this.type === 'number'
    },
  },
  maxValue: {
    type: Number,
    required: function () {
      return this.type === 'number'
    },
  },
  options: {
    type: [
      {
        _id: false,
        label: String,
        value: String,
      },
    ],
    required: function () {
      return this.type === 'multi-select' || this.type === 'radio'
    },
  },
  fileTypes: {
    type: [
      {
        // Define allowed file types (e.g., 'image/jpeg', 'application/pdf')
        type: String,
      },
    ],
    required: function () {
      return this.type === 'file'
    },
  },
  maxFileSizeinKB: {
    type: Number,
    required: function () {
      return this.type === 'file'
    },
  },
  maxFilesAllowed: {
    type: Number,
    required: function () {
      return this.type === 'file'
    },
  },
  customValidations: {
    type: Object, // Store customValidations as an object
    default: {},
  },
})

// Define the Mongoose schema for FormPage
const formPageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 1,
    },
    description: String,
    created: {
      type: Date,
      default: Date.now,
    },
    modified: {
      type: Date,
      default: Date.now,
    },
    expiry: Date,
    inputs: [formInputSchema],
  },
  {
    timestamps: true,
  },
)

const FormPage = mongoose.model('FormPage', formPageSchema)

module.exports = FormPage
