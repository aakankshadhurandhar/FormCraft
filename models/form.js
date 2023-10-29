const mongoose = require('mongoose')
const formInputSchema = require('./_formInput')

/**
 * Mongoose schema for a form.
 * @typedef {Object} FormSchema
 * @property {string} title - The title of the form.
 * @property {string} [description] - The description of the form.
 * @property {Date} [expiry] - The expiry date of the form.
 * @property {Array.<formInputSchema>} inputs - The inputs of the form.
 * @property {Date} createdAt - The timestamp when the form was created.
 * @property {Date} updatedAt - The timestamp when the form was last updated.
 */

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
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

formSchema.pre(
  'deleteOne',
  { document: true, query: true },
  async function (next) {
    await this.model('FormResponse').deleteMany({ formID: this._id })
    next()
  },
)

const Form = mongoose.model('FormPages', formSchema)

module.exports = Form
