require('dotenv').config()
const express = require('express')
const passport = require('passport')
const mongoose = require('mongoose')
const morgan = require('morgan')
const formRouter = require('./routes/')
const initializePassport = require('./config/passport')
const responseFormatter = require('./middlewares/responseFormatter')
const CONFIG = require('./config')
const app = express()
const port = CONFIG.PORT
const mongoString = CONFIG.DATABASE_URL
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger_output.json')

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
app.use(responseFormatter)
app.use('/', formRouter)
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))
app.use((req, res, next) => {
  res.sendNotFound()
})

app.use((err, req, res, next) => {
  res.sendInternalServerError(err)
})
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
