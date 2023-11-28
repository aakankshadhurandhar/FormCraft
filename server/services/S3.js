const aws = require('aws-sdk')
const fs = require('fs')

const CONFIG = require('../config')

aws.config.update({
  secretAccessKey: CONFIG.AWS_SECRET_ACCESS_KEY,
  accessKeyId: CONFIG.AWS_ACCESS_KEY_ID,
  region: CONFIG.AWS_REGION,
})

const s3 = new aws.S3()
const bucketName = CONFIG.S3_BUCKET_NAME

/**
 * Returns the key of a file in S3
 * @param {string} url - The url of the file in S3
 * @returns {string} - The key of the file
 * @description The key of a file is the path of the file in the S3 bucket
 */
function getKey(url) {
  const S3URL = `https://${bucketName}.s3.${CONFIG.AWS_REGION}.amazonaws.com/`
  return url.replace(S3URL, '')
}

/**
 * Deletes a object with a key from S3
 * @param {string} key - The key of the file to delete
 * @description Deletes a object with a key from S3
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
 * @description Deletes multiple files from S3
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
    throw err
  }
}

module.exports.DeleteResponseFilesFromS3 = async (formID) => {
  try {
    // form uploads are in /uploads/formID
    await this.DeleteDirectory(`/uploads/${formID}`)
  } catch (err) {
    throw err
  }
}

/**
 * Deletes a directory with a given path and all its contents from S3
 * @param {string} path - The path of the directory to delete
 * @description Deletes a directory and all its contents from S3
 * @returns {Promise<void>} - A promise that resolves when the directory is deleted
 */
module.exports.DeleteDirectory = async (path) => {
  const params = {
    Bucket: bucketName,
    Prefix: path,
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

  if (listedObjects.IsTruncated) await DeleteDirectory(path)
}

/**
 * Uploads a file to S3
 * @param {Object} file - The file to upload
 * @description Uploads a file to S3
 * @returns {Promise<string>} - A promise that resolves with the S3 URL of the uploaded file
 */
const uploadFile = (file) => {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: bucketName,
      Key: file.key, // File name you want to save as in S3
      //Set Content-Disposition to attachment to rename file on download
      ContentDisposition: `attachment; filename=${file.originalname}`,
      Body: fs.createReadStream(file.path),
    }

    s3.upload(params, (err, data) => {
      // Delete file after uploading to S3
      if (err) {
        reject(err)
      } else {
        fs.unlink(file.path, (err) => {
          if (err) {
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
 * @description Uploads multiple files to S3
 * @returns {Promise<Array>} - A promise that resolves with an array of S3 URLs of the uploaded files
 */
module.exports.UploadToS3 = async (files) => {
  try {
    if (files) {
      const uploadPromises = files.map((file) => uploadFile(file))
      const s3Urls = await Promise.all(uploadPromises)
      return s3Urls
    }
  } catch (err) {
    throw err
  }
}
