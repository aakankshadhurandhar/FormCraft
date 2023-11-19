const mongoose = require('mongoose')
const formInputSchema = require('./_formInput')
const {
  DeleteResponseFilesFromS3: DeleteFormDirectory,
  DeleteDirectory,
} = require('../services/S3')

/**
 * Represents a form in the system.
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

/**
 * Mongoose schema for a form.
 * @type {mongoose.Schema}
 */
const formSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },

    // Define role-based access for shared users
    sharedWith: [
      {
        user: {
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
    background: {
      type: String,
      default: undefined,
    },
    expiry: Date,
    inputs: [formInputSchema],
    steps: {
      type: [Number],
      default: undefined,
    }, // Array containing the indices that split steps
  },
  {
    timestamps: true,
  },
)

/**
 * Middleware function to delete form responses and form directory when a form is deleted.
 */
formSchema.pre(
  'deleteOne',
  { document: true, query: true },
  async function (next) {
    await this.model('FormResponse').deleteMany({ form: this._id })
    DeleteFormDirectory(this._id)
    DeleteDirectory(`/background/${this._id}`)
    next()
  },
)

formSchema.pre(
  'deleteMany',
  { document: true, query: true },
  async function (next) {
    const formIDs = await this.model('FormPages').find(this.getFilter(), '_id')
    await this.model('FormResponse').deleteMany({ form: { $in: formIDs } })
    for (const formID of formIDs) {
      DeleteFormDirectory(formID)
      DeleteDirectory(`/background/${formID}`)
    }
    next()
  },
)

/**
 * Method to strip sensitive fields from form object based on user role.
 * @param {String} userRole - The role of the user accessing the form.
 * @returns {Object} - The form object with sensitive fields stripped.
 * @description This method strips sensitive fields from the form object based on the user role. The user role is passed as a parameter to the method. The method returns the form object with sensitive fields stripped.
 */

formSchema.methods.stripFor = function (userRole) {
  const fieldsToStrip = {
    viewer: ['owner', 'sharedWith', 'createdAt', 'updatedAt', '__v'],
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
// when i get a form , i'll populate the owner and sharedWith fields with username and _id but when i send a form, i'll only send the username and want to remove the _id field

  // Remove owner field
  delete strippedFormData.owner._id

  // Remove sharedWith field
  strippedFormData.sharedWith = strippedFormData.sharedWith.map(
    (userDetails) => {
      userDetails.user = userDetails.user.username
      return userDetails
    },
  )

  return strippedFormData
}



formSchema.methods.toJSON = function () {
  const form = this
  const formObject = form.toObject()


  // Remove owner field
  delete formObject.owner._id
  // Remove sharedWith field
  formObject.sharedWith = formObject.sharedWith.map(
    (userDetails) => {
      userDetails.user = userDetails.user.username
      return userDetails
    },
  )

  return formObject
}

/**
 * Mongoose model for a form.
 * @type {mongoose.Model<Form>}
 * @exports Form
 * @description This is the Mongoose model for a form. It is based on the formSchema.
 */
const Form = mongoose.model('FormPages', formSchema)

module.exports = Form
