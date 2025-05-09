const Joi = require('joi');

// Create Financial Account Validation
const createFinancialAccountSchema = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    type: Joi.string().valid('Cash', 'Bank', 'MobileMoney').required(),
    balance: Joi.number().min(0).required(),
  }),
};

// Update Financial Account Validation
const updateFinancialAccountSchema = {
  body: Joi.object().keys({
    name: Joi.string().optional(),
    type: Joi.string().valid('Cash', 'Bank', 'MobileMoney').optional(),
    balance: Joi.number().min(0).optional(),
  }),
};

module.exports = {
  createFinancialAccountSchema,
  updateFinancialAccountSchema,
};
