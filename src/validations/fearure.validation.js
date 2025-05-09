const Joi = require('joi');

// Create Fearure Validation
const createFearureSchema = {
  body: Joi.object().keys({
    name: Joi.string().required(),
  }),
};

// Update Fearure Validation
const updateFearureSchema = {
  body: Joi.object().keys({
    name: Joi.string().optional(),
  }),
};

module.exports = {
  createFearureSchema,
  updateFearureSchema,
};
