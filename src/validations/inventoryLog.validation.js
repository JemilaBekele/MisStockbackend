const Joi = require('joi');

const createInventoryLogSchema = {
  body: Joi.object().keys({
    itemId: Joi.string().hex().length(24).required(),
    action: Joi.string()
      .valid(
        'Assigned',
        'Returned',
        'Transferred',
        'Received',
        'Disposed',
        'Updated',
        'Checked',
        'Recorded',
      )
      .required(),
    userId: Joi.string().hex().length(24).required(),
    assignedTo: Joi.string().hex().length(24).allow('', null).optional(), // ✅ FIXED
    purchaseId: Joi.string().hex().length(24).allow('', null).optional(), // (recommended)
    quantityChanged: Joi.number().required(),
    timestamp: Joi.date().optional(),
    notes: Joi.string().trim().optional().allow(''),
  }),
};

module.exports = {
  createInventoryLogSchema,
};
