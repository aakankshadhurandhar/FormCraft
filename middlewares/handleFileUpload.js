const multer = require('multer')
const fs = require('fs')
const { default: ShortUniqueId } = require('short-unique-id')
const uid = new ShortUniqueId({ length: 5 })

/**
 * Returns the extension of a file based on its original name.
 *
 * @param {string} originalname - The original name of the file.
 * @returns {string} The extension of the file.
 */
function getExtension(originalname) {
  const parts = originalname.split('.')
  const extension = parts[parts.length - 1]

  return extension
}

/**
 * Checks if a file is allowed to be uploaded based on the form schema.
 *
 * @param {Object} req - The request object.
 * @param {Object} file - The file object.
 * @param {Function} cb - The callback function.
 * @returns {Function} The callback function with an error or true.
 */
const fileFilter = function (req, file, cb) {
  const formSchema = req.form
  const fileInput = formSchema.inputs.find(
    (input) => input.type === 'file' && input.label == file.fieldname,
  )

  if (!fileInput) {
    return cb(new Error('File upload not allowed for some form values'), false)
  }

  if (!fileInput.fileTypes.includes(file.mimetype)) {
    return cb(new Error('File type not allowed '), false)
  }

  if (file.size > fileInput.maxFileSizeinKB * 1024) {
    return cb(new Error('File size exceeds limit'), false)
  }

  cb(null, true)
}

const storage = multer.diskStorage({
  /**
   * Sets the destination folder for uploaded files.
   *
   * @param {Object} req - The request object.
   * @param {Object} file - The file object.
   * @param {Function} cb - The callback function.
   * @returns {Function} The callback function with the upload path.
   */
  destination: function (req, file, cb) {
    const uploadPath = `uploads/`
    fs.mkdirSync(uploadPath, { recursive: true })
    cb(null, uploadPath)
  },
  /**
   * Sets the filename for uploaded files.
   *
   * @param {Object} req - The request object.
   * @param {Object} file - The file object.
   * @param {Function} cb - The callback function.
   * @returns {Function} The callback function with the modified filename.
   */
  filename: function (req, file, cb) {
    const modifiedName = uid.rnd() + '.' + getExtension(file.originalname)
    cb(null, modifiedName)
  },
})

/**
 * Sets up the multer middleware for handling file uploads.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Function} The next middleware function or an error response.
 */
const upload = multer({ storage: storage, fileFilter })

const handleFileUpload = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message })
    }
    next()
  })
}

module.exports = handleFileUpload
