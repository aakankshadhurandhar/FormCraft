const aws = require('aws-sdk')
const fs = require('fs')

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: process.env.AWS_REGION,
})

const s3 = new aws.S3()
const bucketName = process.env.S3_BUCKET_NAME

/**
 * Returns the key of a file in S3
 * @param {string} url - The url of the file in S3
 * @returns {string} - The key of the file
 */
function getKey(url) {
  const S3URL = 'https://formcraft-responses.s3.ap-south-1.amazonaws.com/'
  return url.replace(S3URL, '')
}

/**
 * Deletes a file from S3
 * @param {string} key - The key of the file to delete
 * @returns {Promise<void>} - A promise that resolves when the file is deleted
 */
const deleteObjectFromS3 = (key) => {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: bucketName,
      Key: key, // Key of the file to delete
    }
    s3.deleteObject(params, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

/**
 * Deletes multiple files from S3
 * @param {Array} files - An array of files to delete
 * @returns {Promise<void>} - A promise that resolves when all files are deleted
 */
module.exports.DeleteFilesFromS3 = async (files) => {
  try {
    if (files && Array.isArray(files) && files.length > 0) {
      const deletePromises = files.map((file) =>
        deleteObjectFromS3(getKey(file.path)),
      )
      await Promise.all(deletePromises)
    }
  } catch (err) {
    console.error(err)
    throw err
  }
}

/**
 * Deletes a directory and all its contents from S3
 * @param {string} formID - The ID of the form whose directory is to be deleted
 * @returns {Promise<void>} - A promise that resolves when the directory is deleted
 */
module.exports.DeleteFormDirectory = async (formID) => {
  const params = {
    Bucket: bucketName,
    Prefix: `uploads/${formID}/`,
  }
  const listedObjects = await s3.listObjectsV2(params).promise()

  if (listedObjects.Contents.length === 0) return
  const deleteParams = {
    Bucket: bucketName,
    Delete: { Objects: [] },
  }

  listedObjects.Contents.forEach(({ Key }) => {
    deleteParams.Delete.Objects.push({ Key })
  })

  await s3.deleteObjects(deleteParams).promise()

  if (listedObjects.IsTruncated) await deleteFormDirectory(formID)
}

/**
 * Uploads a file to S3
 * @param {Object} file - The file to upload
 * @returns {Promise<string>} - A promise that resolves with the S3 URL of the uploaded file
 */
const uploadToS3 = (file) => {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: bucketName,
      Key: file.key,
      Body: fs.createReadStream(file.path),
    }

    s3.upload(params, (err, data) => {
      // Delete file after uploading to S3
      if (err) {
        reject(err)
      } else {
        fs.unlink(file.path, (err) => {
          if (err) {
            console.error(err)
            return
          }
        })
        resolve(data.Location)
      }
    })
  })
}

/**
 * Uploads multiple files to S3
 * @param {Array} files - An array of files to upload
 * @returns {Promise<Array>} - A promise that resolves with an array of S3 URLs of the uploaded files
 */
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