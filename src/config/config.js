require('dotenv').config();
const { envValidation } = require('../validations');

// Add DATABASE_URL to your Joi validation schema
const { value: envVars, error } = envValidation.validate(process.env);
const logger = require('./logger');

if (error) {
  logger.error(error);
}

module.exports = {
  port: envVars.PORT,
  db: {
    url: envVars.DATABASE_URL, // Changed from DB_CONNECTION to DATABASE_URL
  },
  env: envVars.NODE_ENV,
  email: envVars.EMAIL,
  emailPassword: envVars.EMAIL_PASSWORD,
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
  },
  rateLimiter: {
    maxAttemptsPerDay: envVars.MAX_ATTEMPTS_PER_DAY,
    maxAttemptsByIpUsername: envVars.MAX_ATTEMPTS_BY_IP_USERNAME,
    maxAttemptsPerEmail: envVars.MAX_ATTEMPTS_PER_EMAIL,
  },
  cspOptions: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline"],
      scriptSrc: ["'self'", "'unsafe-inline"],
      fontSrc: ["'self'", 'fonts.gstatic.com'],
    },
  },
};
