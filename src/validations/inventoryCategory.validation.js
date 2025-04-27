const Joi = require('joi');

// Create Inventory Category Validation
const createInventoryCategorySchema = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().optional().allow(''),
    isAsset: Joi.boolean().required(),
  }),
};

// Update Inventory Category Validation
const updateInventoryCategorySchema = {
  body: Joi.object().keys({
    name: Joi.string().optional(),
    description: Joi.string().optional().allow(''),
    isAsset: Joi.boolean().optional(),
  }),
};

module.exports = {
  createInventoryCategorySchema,
  updateInventoryCategorySchema,
};
