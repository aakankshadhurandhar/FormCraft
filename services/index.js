const aws = require('aws-sdk')
const fs = require('fs')

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: process.env.AWS_REGION,
})

const s3 = new aws.S3()
const bucketName = process.env.S3_BUCKET_NAME

const uploadToS3 = (file) => {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: bucketName,
      Key: file.path, // Use the file path as the key
      Body: fs.createReadStream(file.path),
    }

    s3.upload(params, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data.Location) // Return the S3 URL of the uploaded file
      }
    })
  })
}

module.exports.UploadToS3 = async (files, formID) => {
  try {
    if (files) {
      const uploadPromises = files.map((file) => uploadToS3(file, formID))
      const s3Urls = await Promise.all(uploadPromises)
      return s3Urls
    }
  } catch (err) {
    console.error(err)
    throw err
  }
}
