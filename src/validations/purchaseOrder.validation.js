const Joi = require('joi');

const createPurchaseOrderSchema = {
  body: Joi.object().keys({
    supplierId: Joi.string().hex().length(24).required(),
    orderedBy: Joi.string().hex().length(24).required(),
    orderedAt: Joi.date().optional(),
    receivedAt: Joi.date().optional(),
    status: Joi.string()
      .valid('Pending', 'Partially Received', 'Received', 'Cancelled')
      .optional(),
    notes: Joi.string().trim().optional(),
    items: Joi.array()
      .items(
        Joi.object().keys({
          itemId: Joi.string().hex().length(24).required(),
          quantity: Joi.number().required(),
          unitPrice: Joi.number().required(),
          totalPrice: Joi.number().optional(), // Optional because it's auto-calculated
        }),
      )
      .required(),
  }),
};

const updatePurchaseOrderSchema = {
  body: Joi.object().keys({
    supplierId: Joi.string().hex().length(24).optional(),
    orderedBy: Joi.string().hex().length(24).optional(),
    orderedAt: Joi.date().optional(),
    receivedAt: Joi.date().optional(),
    status: Joi.string()
      .valid('Pending', 'Partially Received', 'Received', 'Cancelled')
      .optional(),
    notes: Joi.string().trim().optional(),
    items: Joi.array()
      .items(
        Joi.object().keys({
          itemId: Joi.string().hex().length(24).required(),
          quantity: Joi.number().required(),
          unitPrice: Joi.number().required(),
          totalPrice: Joi.number().optional(),
        }),
      )
      .optional(),
  }),
};

module.exports = {
  createPurchaseOrderSchema,
  updatePurchaseOrderSchema,
};
