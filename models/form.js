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
    default: function () {
      if (
        this.type === 'number' ||
        this.type == 'multi-select' ||
        this.type === 'radio' ||
        this.type === 'file'
      ) {
        return undefined
      }
      return 0
    },
    required: function () {
      return this.type === 'small-text' && this.minLength !== undefined
    },
  },
  maxLength: {
    type: Number,
    default: function () {
      if (
        this.type === 'number' ||
        this.type == 'multi-select' ||
        this.type === 'radio' ||
        this.type === 'file'
      ) {
        return undefined
      }
      if (this.type === 'small-text' || this.type === 'email') {
        return 255
      }
      return 1000
    },
    required: function () {
      return (
        (this.type === 'small-text' || this.type === 'long-text') &&
        this.maxLength !== undefined
      )
    },
  },
  minValue: {
    type: Number,
    default: function () {
      if (this.type === 'number') {
        return -1e10 // Default value for 'number' type
      }
      return undefined // No default value for other types
    },
    required: function () {
      return this.type === 'number'
    },
  },
  maxValue: {
    type: Number,
    default: function () {
      if (this.type === 'number') {
        return 1e10 // Default value for 'number' type
      }
      return undefined // No default value for other types
    },
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
    default: function () {
      if (this.type === 'multi-select' || this.type === 'radio') {
        return [] // Default value for 'multi-select' and 'radio' types
      }
      return undefined // No default value for other types
    },
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
    default: function () {
      if (this.type === 'file') {
        return []
      }
      return undefined
    },
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
  rules: {
    type: Object, // Store customValidations as an object
    default: {},
    required: false,
  },
})

// Define the Mongoose schema for FormPage
const formSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 1,
    },
    description: String,
    expiry: Date,
    inputs: [formInputSchema],
  },
  {
    timestamps: true,
  },
)

const Form = mongoose.model('FormPages', formSchema)

module.exports = Form