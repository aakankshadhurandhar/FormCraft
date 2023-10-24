const multer = require('multer')
const fs = require('fs')

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
  destination: function (req, file, cb) {
    const formID = req.params.formID
    const uploadPath = `uploads/${formID}/`

    // Create the directory if it doesn't exist
    fs.mkdirSync(uploadPath, { recursive: true })
    cb(null, uploadPath)
  },
  filename: function (req, file, cb) {
    const uniqueIdentifier =
      Date.now() +
      '-' +
      Math.round(Math.random() * 1e9) +
      '-' +
      file.originalname
    cb(null, uniqueIdentifier)
  },
})

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
