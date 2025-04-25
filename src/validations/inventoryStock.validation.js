const Joi = require('joi');

const createInventoryStockSchema = {
  body: Joi.object().keys({
    itemId: Joi.string().hex().length(24).required(),
    locationId: Joi.string().hex().length(24).required(),
    quantity: Joi.number().min(0).required(),
    status: Joi.string()
      .valid('Available', 'In Use', 'Reserved', 'Broken', 'Lost', 'Disposed')
      .optional(),
    lastUpdated: Joi.date().optional(),
  }),
};

const updateInventoryStockSchema = {
  body: Joi.object().keys({
    itemId: Joi.string().hex().length(24).optional(),
    locationId: Joi.string().hex().length(24).optional(),
    quantity: Joi.number().min(0).optional(),
    status: Joi.string()
      .valid('Available', 'In Use', 'Reserved', 'Broken', 'Lost', 'Disposed')
      .optional(),
    lastUpdated: Joi.date().optional(),
  }),
};

module.exports = {
  createInventoryStockSchema,
  updateInventoryStockSchema,
};
