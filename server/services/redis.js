const Redis = require('ioredis')

// Create a Redis client instance and read the .env file or the default localhost
const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

redisClient.on('error', (err) => {
  console.error('Redis error:', err.code);
  redisClient.connected = false;
});

// Handle successful connection
redisClient.on('connect', () => {
  console.log('Redis connected');
  redisClient.connected = true;
});

const redis = new Proxy(redisClient, {
  get: function(target, prop) {
    if (typeof target[prop] === 'function') {
      return function(...args) {
        if (!target.connected) {
          return;
        }
        return target[prop](...args);
      };
    }
    return target[prop];
  }
});


// Export the Redis client instance to be used in other files
module.exports = redis
