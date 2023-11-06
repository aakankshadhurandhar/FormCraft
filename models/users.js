const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const usersSchema = new mongoose.Schema(
  {
    user_name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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
usersSchema.pre('save', async function (next) {
  const user = this
  const hash = await bcrypt.hash(this.password, 10)

  this.password = hash
  next()
})
usersSchema.methods.isValidPassword = async function (password) {
  return bcrypt.compare(password, this.password)
}

// strip password from user object
usersSchema.methods.toJSON = function () {
  const user = this.toObject()
  delete user.password
  return user
}

module.exports = mongoose.model('Users', usersSchema)
