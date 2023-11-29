const multer = require('multer')
const fs = require('fs')
const { default: ShortUniqueId } = require('short-unique-id')
const uid = new ShortUniqueId({ length: 5 })
const MAX_FILE_SIZE_IN_MB = 10

/**
 * Returns the extension of a file based on its original name.
 *
 * @param {string} originalname - The original name of the file.
 * @description This function returns the extension of a file based on its original name.
 * @returns {string} The extension of the file.
 */
function getExtension(originalname) {
  const parts = originalname.split('.')
  const extension = parts[parts.length - 1]

  return extension
}

/**
 * A middleware funciton checks if a file is allowed to be uploaded based on the form schema.
 *
 * @param {Object} req - The request object.
 * @param {Object} file - The file object.
 * @param {Function} cb - The callback function.
 * @description This middleware funciton checks if a file is allowed to be uploaded based on the form schema. If the file is not allowed, an error is passed to the callback function.
 */
const fileFilter = function (req, file, cb) {
  const formSchema = req.form
  const fileInput = formSchema.inputs.find(
    (input) => {
      return input.type === 'file' && input.label == file.fieldname;
    }
  )


  
  if (!fileInput) {
    return cb(new Error('File upload not allowed for some form values'), false)
  }
  // if fileTypes contains "*", all file types are allowed

  if (
    !fileInput.fileTypes.includes('*') &&
    !fileInput.fileTypes.includes(file.mimetype)
  ) {
    return cb(new Error('File type not allowed '), false)
  }
  // if file is greater than allowd max size in form or general max size
  if (
    file.size > fileInput.maxFileSizeinKB * 1024 ||
    file.size > MAX_FILE_SIZE_IN_MB * 1024 * 1024
  ) {
    return cb(new Error('File size exceeds limit'), false)
  }

  cb(null, true)
}

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: function (req, file, cb) {
    const modifiedName = uid.rnd() + '.' + getExtension(file.originalname)
    cb(null, modifiedName)
  },
})

const upload = multer({ storage, fileFilter })

/**
 * Middleware function to handle file uploads using multer.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @description This middleware function handles file uploads using multer. If the file upload fails, an error response is sent.
 */
const FormResponse = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) {
      console.log(err)
      return res.sendBadRequest('File upload failed', err)
      return res.status(400).json({ error: err.message })
    }
    next()
  })
}

// file filter for background image
const backgroundFileFilter = function (req, file, cb) {
  // Size should be max 1 mb
  if (file.size > 1024 * 1024) {
    cb(new Error('File size exceeds limit'), false)
  }
  if (file.mimetype.includes('image')) {
    cb(null, true)
  } else {
    cb(new Error('File type not allowed'), false)
  }
}

const backgroundUpload = multer({ storage, fileFilter: backgroundFileFilter })
const backgroundImage = (req, res, next) => {
  backgroundUpload.single('background')(req, res, (err) => {
    if (err) {
      return res.sendBadRequest('Background image upload failed', err)
      // return res.status(400).json({ error: err.message })
    }
    next()
  })
}

module.exports = { FormResponse, backgroundImage }
