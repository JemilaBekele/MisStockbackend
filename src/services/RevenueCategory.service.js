const httpStatus = require('http-status');
const { RevenueCategory } = require('../models'); // Adjust the path as needed
const ApiError = require('../utils/ApiError');

// Create RevenueCategory
const createRevenueCategory = async (categoryBody) => {
  const category = await RevenueCategory.create(categoryBody);
  return category;
};

// Get RevenueCategory by ID
const getRevenueCategoryById = async (id) => {
  const category = await RevenueCategory.findById(id);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'RevenueCategory not found');
  }
  return category;
};

// Get all RevenueCategories
const getAllRevenueCategories = async () => {
  const categories = await RevenueCategory.find().sort({ name: 1 });
  return {
    categories,
    count: categories.length,
  };
};

// Update RevenueCategory
const updateRevenueCategory = async (id, updateBody) => {
  const category = await getRevenueCategoryById(id);

  Object.assign(category, updateBody);
  await category.save();
  return category;
};

// Delete RevenueCategory
const deleteRevenueCategory = async (id) => {
  const category = await getRevenueCategoryById(id);

  await category.remove();
  return { message: 'RevenueCategory deleted successfully' };
};

module.exports = {
  createRevenueCategory,
  getRevenueCategoryById,
  getAllRevenueCategories,
  updateRevenueCategory,
  deleteRevenueCategory,
};
