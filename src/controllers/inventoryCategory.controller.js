const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const inventoryCategoryService = require('../services');

// Create a new inventory category
const createInventoryCategory = catchAsync(async (req, res) => {
  const category = await inventoryCategoryService.createInventoryCategory(
    req.body,
  );
  res.status(httpStatus.CREATED).send({ category });
});

// Get all inventory categories
const getAllInventoryCategories = catchAsync(async (req, res) => {
  const result = await inventoryCategoryService.getAllInventoryCategories();
  res.status(httpStatus.OK).send(result); // { categories, count }
});

// Get inventory category by ID
const getInventoryCategoryById = catchAsync(async (req, res) => {
  const { categoryId } = req.params;
  const category = await inventoryCategoryService.getInventoryCategoryById(
    categoryId,
  );
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'InventoryCategory not found');
  }
  res.status(httpStatus.OK).send({ category });
});

// Update inventory category
const updateInventoryCategory = catchAsync(async (req, res) => {
  const { categoryId } = req.params;
  const updatedCategory =
    await inventoryCategoryService.updateInventoryCategory(
      categoryId,
      req.body,
    );
  res.status(httpStatus.OK).send({ category: updatedCategory });
});

// Delete inventory category
const deleteInventoryCategory = catchAsync(async (req, res) => {
  const { categoryId } = req.params;
  const response = await inventoryCategoryService.deleteInventoryCategory(
    categoryId,
  );
  res.status(httpStatus.OK).send(response); // { message: 'InventoryCategory deleted successfully' }
});

module.exports = {
  createInventoryCategory,
  getAllInventoryCategories,
  getInventoryCategoryById,
  updateInventoryCategory,
  deleteInventoryCategory,
};
