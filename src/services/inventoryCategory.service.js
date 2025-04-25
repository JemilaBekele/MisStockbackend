const httpStatus = require('http-status');
const { InventoryCategory } = require('../models');
const ApiError = require('../utils/ApiError');

// Create InventoryCategory
const createInventoryCategory = async (categoryBody) => {
  const category = await InventoryCategory.create(categoryBody);
  return category;
};

// Get InventoryCategory by ID
const getInventoryCategoryById = async (id) => {
  const category = await InventoryCategory.findById(id);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'InventoryCategory not found');
  }
  return category;
};

// Get all InventoryCategories
const getAllInventoryCategories = async () => {
  const categories = await InventoryCategory.find().sort({ name: 1 });
  return {
    categories,
    count: categories.length,
  };
};

// Update InventoryCategory
const updateInventoryCategory = async (id, updateBody) => {
  const category = await getInventoryCategoryById(id);

  Object.assign(category, updateBody);
  await category.save();
  return category;
};

// Delete InventoryCategory
const deleteInventoryCategory = async (id) => {
  const category = await getInventoryCategoryById(id);

  await category.remove();
  return { message: 'InventoryCategory deleted successfully' };
};

module.exports = {
  createInventoryCategory,
  getInventoryCategoryById,
  getAllInventoryCategories,
  updateInventoryCategory,
  deleteInventoryCategory,
};
