const Joi = require('joi');

// Create Inventory Location
const createInventoryLocationSchema = {
  body: Joi.object().keys({
    name: Joi.string().trim().required(),
    floor: Joi.number().required(),
    type: Joi.string()
      .valid('Storage', 'Office', 'Laboratory', 'Warehouse', 'Other')
      .required(),
    zone: Joi.string().trim().optional(),
    notes: Joi.string().trim().optional(),
  }),
};

// Update Inventory Location
const updateInventoryLocationSchema = {
  body: Joi.object().keys({
    name: Joi.string().trim().optional(),
    floor: Joi.number().optional(),
    type: Joi.string()
      .valid('Storage', 'Office', 'Laboratory', 'Warehouse', 'Other')
      .optional(),
    zone: Joi.string().allow('', null).optional(),
    notes: Joi.string().allow('', null).optional(),
  }),
};

module.exports = {
  createInventoryLocationSchema,
  updateInventoryLocationSchema,
};
