const Joi = require('joi');

// Create Salary Payment Validation
const createSalaryPaymentSchema = {
  body: Joi.object().keys({
    employeeId: Joi.string().optional(),
    amount: Joi.number().min(0).required(),
    month: Joi.string()
      .regex(/^\d{4}-\d{2}$/)
      .required(),
    status: Joi.string().valid('Pending', 'Paid').required(),
    paymentTransactionId: Joi.string().optional(),
  }),
};

// Update Salary Payment Validation
const updateSalaryPaymentSchema = {
  body: Joi.object().keys({
    employeeId: Joi.string().optional(),
    amount: Joi.number().min(0).optional(),
    month: Joi.string()
      .regex(/^\d{4}-\d{2}$/)
      .optional(),
    status: Joi.string().valid('Pending', 'Paid').optional(),
    paymentTransactionId: Joi.string().optional(),
  }),
};

module.exports = {
  createSalaryPaymentSchema,
  updateSalaryPaymentSchema,
};
