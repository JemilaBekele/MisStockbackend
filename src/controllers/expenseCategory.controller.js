const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { expenseCategoryService } = require('../services');

// Create a new expense category
const createExpenseCategory = catchAsync(async (req, res) => {
  const category = await expenseCategoryService.createExpenseCategory(req.body);
  res.status(httpStatus.CREATED).send({ category });
});

// Get all expense categories
const getAllExpenseCategories = catchAsync(async (req, res) => {
  const result = await expenseCategoryService.getAllExpenseCategories();
  res.status(httpStatus.OK).send(result); // { categories, count }
});

// Get expense category by ID
const getExpenseCategoryById = catchAsync(async (req, res) => {
  const { categoryId } = req.params;
  const category = await expenseCategoryService.getExpenseCategoryById(
    categoryId,
  );
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ExpenseCategory not found');
  }
  res.status(httpStatus.OK).send({ category });
});

// Update expense category
const updateExpenseCategory = catchAsync(async (req, res) => {
  const { categoryId } = req.params;
  const updatedCategory = await expenseCategoryService.updateExpenseCategory(
    categoryId,
    req.body,
  );
  res.status(httpStatus.OK).send({ category: updatedCategory });
});

// Delete expense category
const deleteExpenseCategory = catchAsync(async (req, res) => {
  const { categoryId } = req.params;
  const response = await expenseCategoryService.deleteExpenseCategory(
    categoryId,
  );
  res.status(httpStatus.OK).send(response); // { message: 'ExpenseCategory deleted successfully' }
});

module.exports = {
  createExpenseCategory,
  getAllExpenseCategories,
  getExpenseCategoryById,
  updateExpenseCategory,
  deleteExpenseCategory,
};
