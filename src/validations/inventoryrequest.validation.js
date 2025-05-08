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

// Create Inventory Request Validation
const createInventoryRequestSchema = {
  body: Joi.object({
    type: Joi.string().valid('Purchase', 'StockWithdrawal').required(),
    itemId: objectId.required(),

    quantity: Joi.number().integer().min(1).optional(), // optional, validated in custom logic
    locationId: objectId.optional(),

    itemLocations: Joi.array()
      .items(
        Joi.object({
          locationId: objectId.required(),
          quantity: Joi.number().integer().min(1).required(),
        }),
      )
      .optional(),

    requestedBy: objectId.required(),
    reason: Joi.string().allow('', null),
    status: Joi.string().valid(
      'Pending',
      'Approved',
      'Rejected',
      'Fulfilled',
      'Cancelled',
    ),

    approvals: Joi.array()
      .items(
        Joi.object({
          approverId: objectId.required(),
          decision: Joi.string()
            .valid('Approved', 'Rejected', 'Pending')
            .default('Pending'),
          decisionDate: Joi.date(),
          notes: Joi.string().allow('', null),
        }),
      )
      .optional(),
  }).custom((value, helpers) => {
    const hasQuantity = !!value.quantity;
    const hasItemLocations =
      Array.isArray(value.itemLocations) && value.itemLocations.length > 0;

    if (hasQuantity && hasItemLocations) {
      return helpers.error('any.invalid', {
        message: 'Cannot specify both quantity and itemLocations',
      });
    }

    if (!hasQuantity && !hasItemLocations) {
      return helpers.error('any.invalid', {
        message: 'Either quantity or itemLocations must be provided',
      });
    }

    if (hasQuantity && !value.locationId) {
      return helpers.error('any.invalid', {
        message: 'locationId is required when quantity is provided',
      });
    }

    return value;
  }, 'Custom validation for quantity/itemLocations'),
};

// Update Inventory Request Validation
const updateInventoryRequestSchema = {
  body: Joi.object({
    type: Joi.string().valid('Purchase', 'StockWithdrawal').optional(),
    itemId: objectId.optional(),

    quantity: Joi.number().integer().min(1).optional(),
    locationId: objectId.optional(),

    itemLocations: Joi.array()
      .items(
        Joi.object({
          locationId: objectId.required(),
          quantity: Joi.number().integer().min(1).required(),
        }),
      )
      .optional(),

    requestedBy: objectId.optional(),
    reason: Joi.string().allow('', null).optional(),
    status: Joi.string()
      .valid('Pending', 'Approved', 'Rejected', 'Fulfilled', 'Cancelled')
      .optional(),

    approvals: Joi.array()
      .items(
        Joi.object({
          approverId: objectId.required(),
          decision: Joi.string()
            .valid('Approved', 'Rejected', 'Pending')
            .default('Pending'),
          decisionDate: Joi.date(),
          notes: Joi.string().allow('', null),
        }),
      )
      .optional(),
  }).custom((value, helpers) => {
    const hasQuantity = !!value.quantity;
    const hasItemLocations =
      Array.isArray(value.itemLocations) && value.itemLocations.length > 0;

    if (hasQuantity && hasItemLocations) {
      return helpers.error('any.invalid', {
        message: 'Cannot specify both quantity and itemLocations',
      });
    }

    if (!hasQuantity && !hasItemLocations) {
      return value; // On update, it's OK to omit both (partial update)
    }

    if (hasQuantity && !value.locationId) {
      return helpers.error('any.invalid', {
        message: 'locationId is required when quantity is provided',
      });
    }

    return value;
  }, 'Custom validation for updateInventoryRequest'),
};
// approvalSchema.js
const approvalSchema = {
  body: Joi.object({
    decision: Joi.string().valid('Approved', 'Rejected', 'Pending').required(),
    notes: Joi.string().allow('', null).optional(),
    approverId: objectId.required(),
  }),
};

module.exports = {
  createInventoryRequestSchema,
  updateInventoryRequestSchema,
  approvalSchema,
};
