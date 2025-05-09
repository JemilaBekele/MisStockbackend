const httpStatus = require('http-status');
const ExpenseCategory = require('../models'); // Adjust path as necessary
const ApiError = require('../utils/ApiError');

// Create ExpenseCategory
const createExpenseCategory = async (categoryBody) => {
  const category = await ExpenseCategory.create(categoryBody);
  return category;
};

// Get ExpenseCategory by ID
const getExpenseCategoryById = async (id) => {
  const category = await ExpenseCategory.findById(id);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ExpenseCategory not found');
  }
  return category;
};

// Get all ExpenseCategories
const getAllExpenseCategories = async () => {
  const categories = await ExpenseCategory.find().sort({ name: 1 });
  return {
    categories,
    count: categories.length,
  };
};

// Update ExpenseCategory
const updateExpenseCategory = async (id, updateBody) => {
  const category = await getExpenseCategoryById(id);

  Object.assign(category, updateBody);
  await category.save();
  return category;
};

// Delete ExpenseCategory
const deleteExpenseCategory = async (id) => {
  const category = await getExpenseCategoryById(id);

  await category.remove();
  return { message: 'ExpenseCategory deleted successfully' };
};

module.exports = {
  createExpenseCategory,
  getExpenseCategoryById,
  getAllExpenseCategories,
  updateExpenseCategory,
  deleteExpenseCategory,
};
