const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { categoryService } = require('../services');
const ApiError = require('../utils/ApiError');

// Create Category
const createCategory = catchAsync(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  res.status(httpStatus.CREATED).send({
    success: true,
    message: 'Category created successfully',
    category,
  });
});

// Get Category by ID
const getCategory = catchAsync(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }
  res.status(httpStatus.OK).send({
    success: true,
    category,
  });
});

// Get all Categories
const getCategories = catchAsync(async (req, res) => {
  const result = await categoryService.getAllCategories();
  res.status(httpStatus.OK).send({
    success: true,
    ...result,
  });
});
const getAllSubCategories = catchAsync(async (req, res) => {
  const result = await categoryService.getAllSubCategories();

  res.status(httpStatus.OK).send({
    success: true,
    ...result,
  });
});
const getProductsBySubCategory = catchAsync(async (req, res) => {
  const { subCategoryId } = req.params;

  const result = await categoryService.getProductsBySubCategoryId(
    subCategoryId,
  );

  res.status(httpStatus.OK).send({
    success: true,
    message: 'Products fetched successfully',
    ...result,
  });
});

const getProductsBySubCategoryName = catchAsync(async (req, res) => {
  const { categoryId } = req.params;

  // First get the subcategory by name and category
  const subCategory = await categoryService.getSubCategoriesByCategory(
    categoryId,
  );
console.log("subcategory", subCategory);
  if (!subCategory) {
    return res.status(httpStatus.NOT_FOUND).send({
      success: false,
      message: 'Subcategory not found',
    });
  }
  res.status(httpStatus.OK).send({
    success: true,
    message: 'Products fetched successfully',
    ...subCategory,
  });
});

// Update Category
const updateCategory = catchAsync(async (req, res) => {
  const category = await categoryService.updateCategory(
    req.params.id,
    req.body,
  );
  res.status(httpStatus.OK).send({
    success: true,
    message: 'Category updated successfully',
    category,
  });
});

// Delete Category
const deleteCategory = catchAsync(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  res.status(httpStatus.OK).send({
    success: true,
    message: 'Category deleted successfully',
  });
});

// SubCategory Controllers

// Create SubCategory
const createSubCategory = catchAsync(async (req, res) => {
  const subCategory = await categoryService.createSubCategory(req.body);
  res.status(httpStatus.CREATED).send({
    success: true,
    message: 'SubCategory created successfully',
    subCategory,
  });
});

// Get SubCategory by ID
const getSubCategory = catchAsync(async (req, res) => {
  const subCategory = await categoryService.getSubCategoryById(req.params.id);
  if (!subCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'SubCategory not found');
  }
  res.status(httpStatus.OK).send({
    success: true,
    subCategory,
  });
});

// Get SubCategories by Category ID
const getSubCategoriesByCategory = catchAsync(async (req, res) => {
  const result = await categoryService.getSubCategoriesByCategory();
  res.status(httpStatus.OK).send({
    success: true,
    ...result,
  });
});

// Update SubCategory
const updateSubCategory = catchAsync(async (req, res) => {
  const subCategory = await categoryService.updateSubCategory(
    req.params.id,
    req.body,
  );
  res.status(httpStatus.OK).send({
    success: true,
    message: 'SubCategory updated successfully',
    subCategory,
  });
});

// Delete SubCategory
const deleteSubCategory = catchAsync(async (req, res) => {
  await categoryService.deleteSubCategory(req.params.id);
  res.status(httpStatus.OK).send({
    success: true,
    message: 'SubCategory deleted successfully',
  });
});

module.exports = {
  createCategory,
  getCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  createSubCategory,
  getSubCategory,
  getSubCategoriesByCategory,
  updateSubCategory,
  deleteSubCategory,
  getProductsBySubCategory,
  getProductsBySubCategoryName,
  getAllSubCategories,
};
