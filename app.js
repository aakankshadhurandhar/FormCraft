require('dotenv').config()
const express = require('express')
const passport = require('passport')
const mongoose = require('mongoose')
const morgan = require('morgan')
const formRouter = require('./routes/')
const initializePassport = require('./config/passport')

const app = express()
const port = process.env.PORT || 3000
const mongoString = process.env.DATABASE_URL

mongoose.connect(mongoString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
const database = mongoose.connection
database.on('error', (error) => {
  console.error(error)
})

database.once('connected', () => {
  console.log('Database Connected')
})
initializePassport(passport)

// Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(passport.initialize())
app.use(morgan('dev'))
app.use('/', formRouter)
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
