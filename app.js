require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const formRouter = require('./routes/')
const app = express()
const port = process.env.PORT || 3000
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mongoString = process.env.DATABASE_URL
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

// Middleware
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/', formRouter)
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
