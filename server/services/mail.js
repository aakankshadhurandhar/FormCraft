const nodemailer = require('nodemailer')
const CONFIG = require('../config')

// Setup SMTP
let transporter = nodemailer.createTransport({
  host: CONFIG.EMAIL_SERVICE_HOST,
  port: CONFIG.EMAIL_SERVICE_PORT,
  auth: {
    user: CONFIG.EMAIL_SERVICE_USERNAME,
    pass: CONFIG.EMAIL_SERVICE_PASSWORD,
  },
})

const SENDER_EMAIL = 'FormCraft <no-reply@team.formcraft.com>'

async function sendEmail(mailOptions) {
  mailOptions.from = SENDER_EMAIL

  for (let i = 0; i < 3; i++) {
    try {
      let info = await transporter.sendMail(mailOptions)
      console.log('Email sent: ' + info.response)
      break
    } catch (error) {
      console.log(error)
    }
  }
}

async function sendWelcomeEmail(email, name, token) {
  let validationLink = `http://localhost:3000/users/verify?token=${token}`

  let mailOptions = {
    from: SENDER_EMAIL,
    to: email,
    subject: 'Welcome to FormCraft!',
    text: `Dear ${name}, welcome to our amazing service! We are thrilled to have you on board and can't wait to assist you with all your needs. Please validate your email by clicking on this link: ${validationLink}`,
    html: `<b>Dear ${name},</b><br>Welcome to our amazing service! We are thrilled to have you on board and can't wait to assist you with all your needs. Please validate your email by clicking on this <a href="${validationLink}">link</a>.`,
  }

  return sendEmail(mailOptions)
}

async function sendVerificationEmail(email, name, token) {
  let validationLink = `http://localhost:3000/users/verify?token=${token}`

  let mailOptions = {
    from: SENDER_EMAIL,
    to: email,
    subject: 'Verify your email',
    text: `Dear ${name}, please verify your email by clicking on this link: ${validationLink}`,
    html: `<b>Dear ${name},</b><br>please verify your email by clicking on this <a href="${validationLink}">link</a>.`,
  }

  return sendEmail(mailOptions)
}

async function sendResetPasswordEmail(email, name, token) {
  let validationLink = `http://localhost:3000/users/reset-password?token=${token}`

  let mailOptions = {
    from: SENDER_EMAIL,
    to: email,
    subject: 'Reset your password',
    text: `Dear ${name}, please reset your password by clicking on this link: ${validationLink}`,
    html: `<b>Dear ${name},</b><br>please reset your password by clicking on this <a href="${validationLink}">link</a>.`,
  }

  return sendEmail(mailOptions)
}

async function sendPasswordChangedEmail(email, name) {
  let mailOptions = {
    from: SENDER_EMAIL,
    to: email,
    subject: 'Your password has been Updated',
    text: `Dear ${name}, your password has been changed successfully.`,
    html: `<b>Dear ${name},</b><br>your password has been changed successfully.`,
  }

  return sendEmail(mailOptions)
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendPasswordChangedEmail,
}
