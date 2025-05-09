const Joi = require('joi');

// Create Transaction Validation
const createTransactionSchema = {
  body: Joi.object().keys({
    type: Joi.string().valid('Income', 'Expense', 'Transfer').required(),
    category: Joi.string().required(),
    subCategory: Joi.string().optional().allow(''),
    amount: Joi.number().min(0).required(),
    paymentMethod: Joi.string()
      .valid('Cash', 'BankTransfer', 'Cheque', 'MobileMoney')
      .required(),
    fromAccountId: Joi.string().optional(),
    toAccountId: Joi.string().optional(),
    paidBy: Joi.string().optional(),
    paidByModel: Joi.string().valid('Tenant', 'Buyer').optional(),
    receivedBy: Joi.string().optional(),
    linkedTo: Joi.object()
      .keys({
        leaseId: Joi.string().optional(),
        unitId: Joi.string().optional(),
        employeeId: Joi.string().optional(),
        purchaseOrderId: Joi.string().optional(),
        inventoryRequestId: Joi.string().optional(),
        invoiceId: Joi.string().optional(),
      })
      .optional(),
    status: Joi.string().valid('Pending', 'Completed', 'Cancelled').optional(),
    notes: Joi.string().allow('').optional(),
    date: Joi.date().required(),
  }),
};

// Update Transaction Validation
const updateTransactionSchema = {
  body: Joi.object().keys({
    type: Joi.string().valid('Income', 'Expense', 'Transfer').optional(),
    category: Joi.string().optional(),
    subCategory: Joi.string().optional().allow(''),
    amount: Joi.number().min(0).optional(),
    paymentMethod: Joi.string()
      .valid('Cash', 'BankTransfer', 'Cheque', 'MobileMoney')
      .optional(),
    fromAccountId: Joi.string().optional(),
    toAccountId: Joi.string().optional(),
    paidBy: Joi.string().optional(),
    paidByModel: Joi.string().valid('Tenant', 'Buyer').optional(),
    receivedBy: Joi.string().optional(),
    linkedTo: Joi.object()
      .keys({
        leaseId: Joi.string().optional(),
        unitId: Joi.string().optional(),
        employeeId: Joi.string().optional(),
        purchaseOrderId: Joi.string().optional(),
        inventoryRequestId: Joi.string().optional(),
        invoiceId: Joi.string().optional(),
      })
      .optional(),
    status: Joi.string().valid('Pending', 'Completed', 'Cancelled').optional(),
    notes: Joi.string().allow('').optional(),
    date: Joi.date().optional(),
  }),
};

module.exports = {
  createTransactionSchema,
  updateTransactionSchema,
};
