// config.js

const config = {
  // Server
  PORT: process.env.PORT || 3000,
  HOST: process.env.HOST || 'localhost',

  // Database
  DATABASE_URL:
    process.env.DATABASE_URL || 'mongodb://localhost:27017/mydatabase',

  // AWS
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || 'YOUR_AWS_ACCESS_KEY_ID',
  AWS_SECRET_ACCESS_KEY:
    process.env.AWS_SECRET_ACCESS_KEY || 'YOUR_AWS_SECRET_ACCESS_KEY',
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || 'your-s3-bucket-name',

  // JWT
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || 'YOUR_JWT_SECRET_KEY',
  PASSPORT_SECRET_KEY:
    process.env.PASSPORT_SECRET_KEY || 'YOUR_PASSPORT_SECRET_KEY',

  // Redis
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379/0',

  // Email
  DISABLE_EMAIL_VERIFICATION:
    process.env.DISABLE_EMAIL_VERIFICATION === 'true' || false,
  EMAIL_SERVICE_HOST: process.env.EMAIL_SERVICE_HOST || 'smtp.mailtrap.io',
  EMAIL_SERVICE_PORT: process.env.EMAIL_SERVICE_PORT || 2525,
  EMAIL_SERVICE_USERNAME:
    process.env.EMAIL_SERVICE_USERNAME || 'YOUR_EMAIL_SERVICE_USERNAME',
  EMAIL_SERVICE_PASSWORD:
    process.env.EMAIL_SERVICE_PASSWORD || 'YOUR_EMAIL_SERVICE_PASSWORD',
}
console.log(config.DISABLE_EMAIL_VERIFICATION)
module.exports = config
