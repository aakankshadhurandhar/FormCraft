const mongoose = require('mongoose')
const { DeleteFormDirectory } = require('../services/S3')

/**
 * Mongoose schema for form inputs
 * @typedef {Object} FormInputSchema
 * @property {string} type - Type of input (small-text, long-text, number, email, multi-select, radio, file)
 * @property {string} label - Label for the input
 * @property {number} [minLength] - Minimum length of input (required for small-text type)
 * @property {number} [maxLength] - Maximum length of input (required for small-text and long-text types)
 * @property {number} [minValue] - Minimum value of input (required for number type)
 * @property {number} [maxValue] - Maximum value of input (required for number type)
 * @property {Array<Object>} [options] - Options for multi-select and radio types
 * @property {Array<string>} [fileTypes] - Allowed file types for file type
 * @property {number} [maxFileSizeinKB] - Maximum file size in KB for file type
 * @property {number} [maxFilesAllowed] - Maximum number of files allowed for file type
 * @property {Object} [rules] - Custom validation rules for input
 */

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
        return ["*"]
      }
      return undefined
    },
    required: function () {
      return this.type === 'file'
    },
  },
  maxFileSizeinKB: {
    type: Number,
    default: function () {
      if (this.type === 'file') {
        return 2048
      }
      return undefined
    },
    required: function () {
      return this.type === 'file'
    },
  },
  maxFilesAllowed: {
    type: Number,
    default: function () {
      if (this.type === 'file') {
        return 1
      }
      return undefined
    },
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

/**
 * Mongoose schema for form
 * @typedef {Object} FormSchema
 * @property {string} title - Title of the form
 * @property {string} [description] - Description of the form
 * @property {Date} [expiry] - Expiry date of the form
 * @property {Array<FormInputSchema>} inputs - Array of form inputs
 * @property {Date} createdAt - Timestamp of form creation
 * @property {Date} updatedAt - Timestamp of last form update
 */
const formSchema = new mongoose.Schema(
  {
    userId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required:true
    },
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

/**
 * Middleware to delete all responses to a form when the form is deleted
 */
formSchema.pre(
  'deleteOne',
  { document: true, query: true },
  async function (next) {
    await this.model('FormResponse').deleteMany({ formID: this._id })
    await DeleteFormDirectory(this._id)
    next()
  },
)

const Form = mongoose.model('FormPages', formSchema)

module.exports = Form
