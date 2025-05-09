const Joi = require('joi');

// Create Revenue Category Validation
const createRevenueCategorySchema = {
  body: Joi.object().keys({
    name: Joi.string().required(),
  }),
};

// Update Revenue Category Validation
const updateRevenueCategorySchema = {
  body: Joi.object().keys({
    name: Joi.string().optional(),
  }),
};

module.exports = {
  createRevenueCategorySchema,
  updateRevenueCategorySchema,
};
