const Joi = require('joi');

// Create Invoice Validation
const createInvoiceSchema = {
  body: Joi.object().keys({
    issuedTo: Joi.string().optional(),
    issuedToModel: Joi.string().valid('Tenant', 'Buyer').required(),
    issuedBy: Joi.string().optional(),
    type: Joi.string().valid('Rent', 'Sale', 'Service', 'Penalty').required(),
    unitId: Joi.string().optional(),
    linkedLeaseId: Joi.string().optional(),
    linkedSaleId: Joi.string().optional(),
    amount: Joi.number().min(0).required(),
    paidAmount: Joi.number().min(0).optional(),
    status: Joi.string()
      .valid('Unpaid', 'Partially Paid', 'Paid', 'Overdue')
      .optional(),
    dueDate: Joi.date().required(),
    paymentIds: Joi.array().items(Joi.string().optional()),
    notes: Joi.string().allow('').optional(),
  }),
};

// Update Invoice Validation
const updateInvoiceSchema = {
  body: Joi.object().keys({
    issuedTo: Joi.string().optional(),
    issuedToModel: Joi.string().valid('Tenant', 'Buyer').optional(),
    issuedBy: Joi.string().optional(),
    type: Joi.string().valid('Rent', 'Sale', 'Service', 'Penalty').optional(),
    unitId: Joi.string().optional(),
    linkedLeaseId: Joi.string().optional(),
    linkedSaleId: Joi.string().optional(),
    amount: Joi.number().min(0).optional(),
    paidAmount: Joi.number().min(0).optional(),
    status: Joi.string()
      .valid('Unpaid', 'Partially Paid', 'Paid', 'Overdue')
      .optional(),
    dueDate: Joi.date().optional(),
    paymentIds: Joi.array().items(Joi.string().optional()),
    notes: Joi.string().allow('').optional(),
  }),
};

module.exports = {
  createInvoiceSchema,
  updateInvoiceSchema,
};
