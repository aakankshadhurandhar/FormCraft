const mongoose = require('mongoose')

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
      default: 1000000000,
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
}

// Add discriminators to the formInputSchema
Object.keys(inputDiscriminators).forEach((type) => {
  formInputSchema.discriminator(type, inputDiscriminators[type])
})

module.exports = formInputSchema