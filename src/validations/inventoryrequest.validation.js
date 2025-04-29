const Joi = require('joi');
const mongoose = require('mongoose');

// Reusable ObjectId validator
const objectId = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'ObjectId validation');

// Approval Subschema Validation
const approvalSchema = Joi.object().keys({
  approverId: objectId.required(),
  decision: Joi.string().valid('Approved', 'Rejected', 'Pending').optional(),
  decisionDate: Joi.date().optional(),
  notes: Joi.string().optional().allow(''),
});

// Create Inventory Request Validation
const createInventoryRequestSchema = {
  body: Joi.object().keys({
    type: Joi.string().valid('Purchase', 'StockWithdrawal').required(),
    itemId: objectId.required(),
    quantity: Joi.number().integer().min(1).required(),
    requestedBy: objectId.required(),
    locationId: objectId.optional(),
    reason: Joi.string().optional().allow(''),
    status: Joi.string()
      .valid('Pending', 'Approved', 'Rejected', 'Fulfilled', 'Cancelled')
      .optional(),
    approvals: Joi.array().items(approvalSchema).optional(),
  }),
};

// Update Inventory Request Validation
const updateInventoryRequestSchema = {
  body: Joi.object().keys({
    type: Joi.string().valid('Purchase', 'StockWithdrawal').optional(),
    itemId: objectId.optional(),
    quantity: Joi.number().integer().min(1).optional(),
    requestedBy: objectId.optional(),
    locationId: objectId.optional(),
    reason: Joi.string().optional().allow(''),
    status: Joi.string()
      .valid('Pending', 'Approved', 'Rejected', 'Fulfilled', 'Cancelled')
      .optional(),
    approvals: Joi.array().items(approvalSchema).optional(),
  }),
};

module.exports = {
  createInventoryRequestSchema,
  updateInventoryRequestSchema,
};
