const express = require('express');

const router = express.Router();
const validate = require('../middlewares/validate');
const { ExpenseCategoryValidation } = require('../validations');
const { ExpenseCategoryController } = require('../controllers');
const auth = require('../middlewares/auth');

// Expense Category Routes

// Create a category
router.post(
  '/api/expense-category',
  auth,
  validate(ExpenseCategoryValidation.createExpenseCategorySchema),
  ExpenseCategoryController.createExpenseCategory,
);

// Get all categories
router.get(
  '/api/expense-categories',
  auth,
  ExpenseCategoryController.getAllExpenseCategories,
);

// Get a single category by ID
router.get(
  '/api/expense-category/:categoryId',
  auth,
  ExpenseCategoryController.getExpenseCategoryById,
);

// Update a category
router.put(
  '/api/expense-category/:categoryId',
  auth,
  validate(ExpenseCategoryValidation.updateExpenseCategorySchema),
  ExpenseCategoryController.updateExpenseCategory,
);

// Delete a category
router.delete(
  '/api/expense-category/:categoryId',
  auth,
  ExpenseCategoryController.deleteExpenseCategory,
);

module.exports = router;
