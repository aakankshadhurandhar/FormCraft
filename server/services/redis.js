const Redis = require('ioredis')
const CONFIG = require('../config')

// Create a Redis client instance and read the .env file or the default localhost
const redisClient = new Redis(CONFIG.REDIS_URL)
let errorPrinted = false

redisClient.on('error', (err) => {
  if (!errorPrinted) {
    console.error('Redis error:', err.code)
    errorPrinted = true
  }
})

// Handle successful connection
redisClient.on('connect', () => {
  console.log('Redis connected')
  redisClient.connected = true
  errorPrinted = false
})

const redis = new Proxy(redisClient, {
  get: function (target, prop) {
    if (typeof target[prop] === 'function') {
      return function (...args) {
        if (!target.connected) {
          return
        }
        return target[prop](...args)
      }
    }
    return target[prop]
  },
})

// Export the Redis client instance to be used in other files
module.exports = redis
