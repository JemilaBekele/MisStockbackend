const Joi = require('joi');
const mongoose = require('mongoose');

const objectId = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'ObjectId validation');

// Create Inventory Item Validation
const createInventoryItemSchema = {
  body: Joi.object().keys({
    itemName: Joi.string().required(),
    categoryId: objectId.required(),
    unitType: Joi.string().valid('Consumable', 'Asset').required(),
    details: Joi.string().optional().allow(''),
    assignedUserId: objectId.optional(),
    purchaseId: objectId.optional(),
    locationId: objectId.optional(),
    lastUsed: Joi.date().optional(),
    status: Joi.string()
      .valid('Available', 'In Use', 'Broken', 'Lost', 'Disposed')
      .optional(),
  }),
};

// Update Inventory Item Validation
const updateInventoryItemSchema = {
  body: Joi.object().keys({
    itemName: Joi.string().optional(),
    categoryId: objectId.optional(),
    unitType: Joi.string().valid('Consumable', 'Asset').optional(),
    details: Joi.string().optional().allow(''),
    assignedUserId: objectId.optional(),
    purchaseId: objectId.optional(),
    locationId: objectId.optional(),
    lastUsed: Joi.date().optional(),
    status: Joi.string()
      .valid('Available', 'In Use', 'Broken', 'Lost', 'Disposed')
      .optional(),
  }),
};

module.exports = {
  createInventoryItemSchema,
  updateInventoryItemSchema,
};
