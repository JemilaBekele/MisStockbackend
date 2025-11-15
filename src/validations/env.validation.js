const joi = require('joi');

const envVarSchema = joi
  .object({
    // In your env validation file (likely validations.js)
    DB_CONNECTION: joi.string().uri().optional(),
    DATABASE_URL: joi.string().uri().required(),
    PORT: joi.number().positive().default(3000),
  })
  .unknown();
module.exports = envVarSchema;
