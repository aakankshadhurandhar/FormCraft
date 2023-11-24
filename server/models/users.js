const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwtEncode = require('../utils/jwtEncode')
/**
 * Mongoose schema for users collection.
 * @typedef {Object} usersSchema
 * @property {string} username - Required, unique, and trimmed string representing the user's name.
 * @property {string} email - Required, unique, and trimmed string representing the user's email.
 * @property {string} password - Required string representing the user's password.
 * @property {Date} timestamps - Timestamps for when the document was created and last updated.
 */
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next()
  }
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

userSchema.methods.isValidPassword = async function (password) {
  return bcrypt.compare(password, this.password)
}

// strip password from user object
userSchema.methods.toJSON = function () {
  const user = this.toObject()
  delete user._id
  delete user.__v
  delete user.password
  return user
}

// Generate JWT token
userSchema.methods.generateToken = function () {
  const payload = {

    id: this._id,
    username: this.username,
  }
  return jwtEncode.generateToken(payload)
}

userSchema.pre(
  'deleteOne',
  { document: true, query: false },
  async function (next) {
    // Delete all forms created by the user
    const formIDs = await this.model('Forms').find(this.getFilter(), '_id')
    await mongoose.model('Forms').deleteMany({ owner: this._id })
    // Invalidate form cache
    for (const formID of formIDs) {
      redis.del(formID)
    }
    next()
  },
)

module.exports = mongoose.model('Users', userSchema)
