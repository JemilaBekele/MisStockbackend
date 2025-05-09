const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const revenueCategoryService = require('../services');

// Create a new revenue category
const createRevenueCategory = catchAsync(async (req, res) => {
  const category = await revenueCategoryService.createRevenueCategory(req.body);
  res.status(httpStatus.CREATED).send({ category });
});

// Get all revenue categories
const getAllRevenueCategories = catchAsync(async (req, res) => {
  const result = await revenueCategoryService.getAllRevenueCategories();
  res.status(httpStatus.OK).send(result); // { categories, count }
});

// Get revenue category by ID
const getRevenueCategoryById = catchAsync(async (req, res) => {
  const { categoryId } = req.params;
  const category = await revenueCategoryService.getRevenueCategoryById(
    categoryId,
  );
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'RevenueCategory not found');
  }
  res.status(httpStatus.OK).send({ category });
});

// Update revenue category
const updateRevenueCategory = catchAsync(async (req, res) => {
  const { categoryId } = req.params;
  const updatedCategory = await revenueCategoryService.updateRevenueCategory(
    categoryId,
    req.body,
  );
  res.status(httpStatus.OK).send({ category: updatedCategory });
});

// Delete revenue category
const deleteRevenueCategory = catchAsync(async (req, res) => {
  const { categoryId } = req.params;
  const response = await revenueCategoryService.deleteRevenueCategory(
    categoryId,
  );
  res.status(httpStatus.OK).send(response); // { message: 'RevenueCategory deleted successfully' }
});

module.exports = {
  createRevenueCategory,
  getAllRevenueCategories,
  getRevenueCategoryById,
  updateRevenueCategory,
  deleteRevenueCategory,
};
