const aws = require('aws-sdk')
const fs = require('fs')

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: process.env.AWS_REGION,
})

const s3 = new aws.S3()
const bucketName = process.env.S3_BUCKET_NAME

function getKey(path) {
  const S3URL = 'https://formcraft-responses.s3.ap-south-1.amazonaws.com/'
  return path.replace(S3URL, '')
}

// Function to delete a file from S3
const deleteFromS3 = (key) => {
  console.log(key)
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: bucketName,
      Key: key, // Key of the file to delete
    }
    s3.deleteObject(params, (err, data) => {
      if (err) {
        console.log(28, err, data)
        reject(err)
      } else {
        console.log(31, err, data)
        resolve()
      }
    })
  })
}

module.exports.DeleteFromS3 = async (files) => {
  try {
    if (files && Array.isArray(files) && files.length > 0) {
      const deletePromises = files.map((file) =>
        deleteFromS3(getKey(file.path)),
      )
      await Promise.all(deletePromises)
    }
  } catch (err) {
    console.error(err)
    throw err
  }
}

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

module.exports.UploadToS3 = async (files) => {
  try {
    if (files) {
      const uploadPromises = files.map((file) => uploadToS3(file))
      const s3Urls = await Promise.all(uploadPromises)
      return s3Urls
    }
  } catch (err) {
    console.error(err)
    throw err
  }
}
