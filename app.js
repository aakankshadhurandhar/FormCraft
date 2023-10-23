require('dotenv').config()
const express = require('express')
const passport = require('passport')
const mongoose = require('mongoose')
const formRouter = require('./routes/')
const app = express()
const port = process.env.PORT || 3000
const bodyParser = require('body-parser')
const mongoString = process.env.DATABASE_URL
const session = require('express-session')
const initializePassport = require('./config/passport')
mongoose.connect(mongoString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
const database = mongoose.connection
database.on('error', (error) => {
  console.log(error)
})

database.once('connected', () => {
  console.log('Database Connected')
})
initializePassport(passport)

const secretKey = process.env.PASSPORT_SECRET_KEY

app.use(
  session({
    secret: secretKey,
    resave: false,
    saveUninitialized: false,
  }),
)
// Middleware
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(passport.initialize())
app.use(passport.session())
app.use('/', formRouter)
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
