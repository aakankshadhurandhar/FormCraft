const mongoose = require('mongoose')
const formInputSchema = require('./_formInput')
const { DeleteFormDirectory } = require('../services/S3')

/**
 * @typedef {Object} Form
 * @property {String} title - The title of the form.
 * @property {String} description - The description of the form.
 * @property {Boolean} published - Whether the form is published or not.
 * @property {Date} expiry - The expiry date of the form.
 * @property {FormInput[]} inputs - The input fields of the form.
 * @property {mongoose.Schema.Types.ObjectId} userId - The ID of the user who created the form.
 * @property {Date} createdAt - The date when the form was created.
 * @property {Date} updatedAt - The date when the form was last updated.
 */

const formSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },

    // Define role-based access for shared users
    sharedWith: [
      {
        userID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Users',
          required: true,
        },
        role: {
          type: String,
          enum: ['viewer', 'editor', 'admin'],
          required: true,
          default: 'viewer',
        },
        _id: false,
      },
    ],
    title: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 200,
    },
    description: {
      type: String,
      default: undefined,
    },
    published: {
      type: Boolean,
      default: false,
    },
    expiry: Date,
    inputs: [formInputSchema],
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
    DeleteFormDirectory(this._id)
    next()
  },
)

// strip sensitive fields from form object based on user role
formSchema.methods.stripFor = function (userRole) {
  const fieldsToStrip = {
    viewer: ['userID', 'sharedWith', 'createdAt', 'updatedAt', '__v'],
    editor: ['sharedWith', 'updatedAt', '__v'],
    admin: [],
    owner: [],
  }

  const strippedFormData = { ...this.toObject() }

  if (fieldsToStrip[userRole]) {
    for (const field of fieldsToStrip[userRole]) {
      delete strippedFormData[field]
    }
  }

  return strippedFormData
}

const Form = mongoose.model('FormPages', formSchema)

module.exports = Form
