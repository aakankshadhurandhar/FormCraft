/**
 * Mongoose schema for form input.
 *
 * @typedef {Object} FormInputSchema
 * @property {boolean} required - Whether the input is required or not.
 * @property {string} label - The label for the input.
 * @property {string} [description] - The description for the input.
 */
const formInputSchema = new mongoose.Schema(
  {
    _id: false,
    label: {
      type: String,
      required: true,
    },
    required: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      default: undefined,
    },
  },
  { discriminatorKey: 'type' },
)

const basicTextInputSchema = {
  _id: false,
  min: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: 100,
  },
  rules: {
    type: Object,
    default: undefined,
  },
}

/**
 * Discriminators for different types of form inputs.
 * @typedef {Object} InputDiscriminators
 * @property {mongoose.Schema} small - Schema for small text input.
 * @property {mongoose.Schema} long - Schema for long text input.
 * @property {mongoose.Schema} email - Schema for email input.
 * @property {mongoose.Schema} number - Schema for number input.
 * @property {mongoose.Schema} multi - Schema for multi-select input.
 * @property {mongoose.Schema} radio - Schema for radio button input.
 * @property {mongoose.Schema} file - Schema for file upload input.
 * @property {mongoose.Schema} date - Schema for date input.
 * @property {mongoose.Schema} time - Schema for time input.
 * @property {mongoose.Schema} none - Schema for no input.
 * @description Discriminators for different types of form inputs.
 */
const inputDiscriminators = {
  small: new mongoose.Schema({
    ...basicTextInputSchema,
  }),
  long: new mongoose.Schema({
    ...basicTextInputSchema,
  }),
  email: new mongoose.Schema({
    ...basicTextInputSchema,
  }),
  number: new mongoose.Schema({
    ...basicTextInputSchema,
    max: {
      type: Number,
      default: 1e20,
    },
  }),
  multi: new mongoose.Schema({
    _id: false,
    options: [
      {
        _id: false,
        label: String,
        value: String,
      },
    ],
  }),
  radio: new mongoose.Schema({
    _id: false,
    options: [
      {
        _id: false,
        label: String,
        value: String,
      },
    ],
  }),
  file: new mongoose.Schema({
    _id: false,
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 1,
    },
    fileTypes: {
      type: [String],
      default: ['*'],
    },
    maxFileSizeinKB: {
      type: Number,
      default: 2048,
    },
  }),
  date: new mongoose.Schema({
    _id: false,
    min: {
      type: String,
      default: undefined,
    },
    max: {
      type: String,
      default: undefined,
    },
  }),
  time: new mongoose.Schema({
    _id: false,
    min: {
      type: String,
      default: undefined,
    },
    max: {
      type: String,
      default: undefined,
    },
  }),
  none: new mongoose.Schema({
    _id: false,
    label: {
      type: String,
      default: undefined,
    },
  }),
}

// Add discriminators to the formInputSchema
Object.keys(inputDiscriminators).forEach((type) => {
  formInputSchema.discriminator(type, inputDiscriminators[type])
})


/**
 * @description This module exports a Mongoose schema for form input and discriminators for different types of form inputs.
 * @module _formInput
 * @type {import('mongoose').Schema}
 */
module.exports = formInputSchema
