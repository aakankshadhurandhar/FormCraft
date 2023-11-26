const moment = require('moment');
const redis = require('../services/redis');


const WINDOW_SIZE_IN_HOURS = 24;
const MAX_WINDOW_REQUEST_COUNT = 90;
const WINDOW_LOG_INTERVAL_IN_HOURS = 1;

/**
 * A custom Redis rate limiter function that limits the number of requests per IP address.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The callback function to call when the request processing is complete.
 * @return {Promise} A promise that resolves when the rate limiter logic is complete.
 */
const customRedisRateLimiter = async (req, res, next) => {
  try {
    if (!redis.connected) {
        await redis.connect();
      }
    const record = await redis.get(req.ip);
    const currentRequestTime = moment();

    if (record == null) {
      let newRecord = [];
      let requestLog = {
        requestTimeStamp: currentRequestTime.unix(),
        requestCount: 1,
      };
      newRecord.push(requestLog);
      await redis.set(req.ip, JSON.stringify(newRecord));
      next();
    } else {
      let data = JSON.parse(record);
      let windowStartTimestamp = moment().subtract(WINDOW_SIZE_IN_HOURS, 'hours').unix();
      let requestsWithinWindow = data.filter((entry) => {
        return entry.requestTimeStamp > windowStartTimestamp;
      });
      let totalWindowRequestsCount = requestsWithinWindow.reduce((accumulator, entry) => {
        return accumulator + entry.requestCount;
      }, 0);

      if (totalWindowRequestsCount >= MAX_WINDOW_REQUEST_COUNT) {
        res.status(429).json({ error: `You have exceeded the ${MAX_WINDOW_REQUEST_COUNT} requests in ${WINDOW_SIZE_IN_HOURS} hrs limit!` });
      } else {
        let lastRequestLog = data[data.length - 1];
        let potentialCurrentWindowIntervalStartTimeStamp = currentRequestTime.subtract(WINDOW_LOG_INTERVAL_IN_HOURS, 'hours').unix();

        if (lastRequestLog.requestTimeStamp > potentialCurrentWindowIntervalStartTimeStamp) {
          lastRequestLog.requestCount++;
          data[data.length - 1] = lastRequestLog;
        } else {
          data.push({
            requestTimeStamp: currentRequestTime.unix(),
            requestCount: 1,
          });
        }

        await redis.set(req.ip, JSON.stringify(data));
        redis.quit();
        next();
      }
    }
  } catch (error) {
    next(error);
  }
};

module.exports = customRedisRateLimiter;