const Joi = require('joi');

// Create Expense Category Validation
const createExpenseCategorySchema = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    isRecurring: Joi.boolean().required(),
  }),
};

// Update Expense Category Validation
const updateExpenseCategorySchema = {
  body: Joi.object().keys({
    name: Joi.string().optional(),
    isRecurring: Joi.boolean().optional(),
  }),
};

module.exports = {
  createExpenseCategorySchema,
  updateExpenseCategorySchema,
};
