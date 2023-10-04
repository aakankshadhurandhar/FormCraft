const multer = require('multer');
const fs = require('fs');

const fileFilter = function (req, file, cb) {
  const formSchema = req.form;
  const fileInput = formSchema.inputs.find((input) => input.type === 'file');

  if (!fileInput) {
    return cb(new Error('File upload not allowed for this form'), false);
  }

  if (!fileInput.fileTypes.includes(file.mimetype)) {
    return cb(new Error('File type not allowed'), false);
  }

  if (file.size > fileInput.maxFileSizeinKB * 1024) {
    return cb(new Error('File size exceeds limit'), false);
  }

  const fieldname = file.fieldname;
  if (fieldname !== fileInput.label) {
    return cb(new Error('File fieldname does not match form input label'), false);
  }

  cb(null, true); // File is accepted
};


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    
    const formID = req.params.formId
    const uploadPath = `uploads/${formID}/`;

    // Create the directory if it doesn't exist
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueIdentifier = Date.now() + '-' + Math.round(Math.random() * 1E9)  + "-"+ file.originalname;
    cb(null, uniqueIdentifier );
  },
});

const upload = multer({ storage: storage,fileFilter });

const handleFileUpload = (req, res, next) => { 
  upload.any()(req, res, (err) => {
    if (err) {
      
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

module.exports = handleFileUpload;