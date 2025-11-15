// src/middlewares/authLimiter.js

// 1. Change the import from RateLimiterMongo to RateLimiterMemory
// REMOVE: const { RateLimiterMongo } = require('rate-limiter-flexible');
const { RateLimiterMemory } = require('rate-limiter-flexible'); // ADD this line

const httpStatus = require('http-status');
const config = require('../config/config');
const ApiError = require('../utils/ApiError');

// 2. REMOVE the MongoDB-specific options object (dbName is only for Mongo)
// REMOVE:
// const rateLimiterOptioins = {
//   dbName: 'blog_app',
//   blockDuration: 60 * 60 * 24, // blockDuration might not apply to all stores like memory
// };

// 3. Create instances using RateLimiterMemory and remove MongoDB-specific options

// Change from new RateLimiterMongo(...) to new RateLimiterMemory(...)
const emailIpBruteLimiter = new RateLimiterMemory({
  // REMOVE ...rateLimiterOptioins spread
  points: config.rateLimiter.maxAttemptsByIpUsername,
  duration: 60 * 10, // Use duration directly
  // REMOVE any mongo: or storeClient: options if they were implicitly added
});

// Change from new RateLimiterMongo(...) to new RateLimiterMemory(...)
const slowerBruteLimiter = new RateLimiterMemory({
  // REMOVE ...rateLimiterOptioins spread
  points: config.rateLimiter.maxAttemptsPerDay,
  duration: 60 * 60 * 24, // Use duration directly
  // REMOVE any mongo: or storeClient: options
});

// Change from new RateLimiterMongo(...) to new RateLimiterMemory(...)
const emailBruteLimiter = new RateLimiterMemory({
  // REMOVE ...rateLimiterOptioins spread
  points: config.rateLimiter.maxAttemptsPerEmail,
  duration: 60 * 60 * 24, // Use duration directly
  // REMOVE any mongo: or storeClient: options
});

// The core logic using .get() remains the same, as .get() exists on RateLimiterMemory
const authLimiter = async (req, res, next) => {
  const ipAddr = req.connection.remoteAddress;
  const emailIpKey = `${req.body.email}_${ipAddr}`;

  const [slowerBruteRes, emailIpRes, emailBruteRes] = await Promise.all([
    slowerBruteLimiter.get(ipAddr),
    emailIpBruteLimiter.get(emailIpKey),
    emailBruteLimiter.get(req.body.email),
  ]);
  let retrySeconds = 0;
  if (
    slowerBruteRes &&
    slowerBruteRes.consumedPoints >= config.rateLimiter.maxAttemptsPerDay
  ) {
    retrySeconds = Math.floor(slowerBruteRes.msBeforeNext / 1000) || 1;
  } else if (
    emailIpRes &&
    emailIpRes.consumedPoints >= config.rateLimiter.maxAttemptsByIpUsername
  ) {
    retrySeconds = Math.floor(emailIpRes.msBeforeNext / 1000) || 1;
  } else if (
    emailBruteRes &&
    emailBruteRes.consumedPoints > config.rateLimiter.maxAttemptsPerEmail
  ) {
    retrySeconds = Math.floor(emailBruteRes.msBeforeNext / 1000) || 1;
  }

  if (retrySeconds > 0) {
    res.set('Retry-After', String(retrySeconds));
    return next(
      new ApiError(httpStatus.TOO_MANY_REQUESTS, 'Too many requests'),
    );
  }
  next();
};

module.exports = {
  // You likely only need to export authLimiter if it's used as middleware
  // Exporting the limiter instances themselves isn't typical unless accessed elsewhere
  // Consider removing these two lines if they are not used outside this file:
  // emailIpBruteLimiter,
  // slowerBruteLimiter,
  authLimiter,
};
