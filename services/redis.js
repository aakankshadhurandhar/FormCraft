const Redis = require('ioredis')

// Create a Redis client instance and read the .env file or the default localhost
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

// Export the Redis client instance to be used in other files
module.exports = redis
