const Users = require('../models')
const users = require('../models/users')
const { hashPassword } = require('../utils/passwordValidation')
const { validateUserSchema } = require('../validators/validations')
module.exports.registerUser = async (req, res) => {
  try {
    const { user_name, email, password } = req.body
    const { error } = validateUserSchema(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }
    const user =await  users.findOne({email})
    if (user) {
      return res.status(409).json({ error: 'Email already exists' })
    }
    const hashedPassword = await hashPassword(password)
    const newUser = new users({ user_name, password: hashedPassword , email})
    await newUser.save()
    res.status(201).json({ message: 'User registered successfully' })
  } catch(err) {
    console.log(err);
    res.status(500).json({ statusCode: 500, message: 'Internal server error' })
  }
}
