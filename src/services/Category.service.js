const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const prisma = require('./prisma');

// Get Category by ID
const getCategoryById = async (id) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      subCategories: true,
    },
  });
  return category;
};

// Get Category by Name
const getCategoryByName = async (name) => {
  const category = await prisma.category.findFirst({
    where: { name },
  });
  return category;
};

// Get all Categories
const getAllCategories = async () => {
  const categories = await prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
    include: {
      subCategories: true,
    },
  });

  return {
    categories,
    count: categories.length,
  };
};

// Create Category
const createCategory = async (categoryBody) => {
  // Check if category with same name already exists
  if (await getCategoryByName(categoryBody.name)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Category name already taken');
  }

  const category = await prisma.category.create({
    data: categoryBody,
  });
  return category;
};

// Update Category
const updateCategory = async (id, updateBody) => {
  const existingCategory = await getCategoryById(id);
  if (!existingCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }

  // Check if name is being updated to an existing category name
  if (updateBody.name && updateBody.name !== existingCategory.name) {
    if (await getCategoryByName(updateBody.name)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Category name already taken');
    }
  }

  const updatedCategory = await prisma.category.update({
    where: { id },
    data: updateBody,
    include: {
      products: true,
      subCategories: true,
    },
  });

  return updatedCategory;
};

// Delete Category
const deleteCategory = async (id) => {
  const existingCategory = await getCategoryById(id);
  if (!existingCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }

  await prisma.category.delete({
    where: { id },
  });

  return { message: 'Category deleted successfully' };
};

// SubCategory Services

// Get SubCategory by ID
const getSubCategoryById = async (id) => {
  const subCategory = await prisma.subCategory.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });
  return subCategory;
};

// Get SubCategory by Name and Category ID
const getSubCategoriesByCategory = async (categoryId) => {
  try {
    const subCategories = await prisma.subCategory.findMany({
      where: {
        categoryId,
      },
      select: {
        id: true,
        name: true,
        categoryId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        name: 'asc', // Optional: order by name alphabetically
      },
    });
    return {
      subCategories,
      count: subCategories.length,
    };
  } catch (error) {
    throw new Error('Failed to fetch subcategories');
  }
};
const getAllSubCategories = async () => {
  const subcategories = await prisma.subCategory.findMany({
    orderBy: {
      name: 'asc',
    },
    include: {
      category: true,
    },
  });
  return {
    subcategories,
    count: subcategories.length,
  };
};
const getProductsBySubCategoryId = async (subCategoryId) => {
  try {
    // Get all products with the specified subcategory ID
    const products = await prisma.product.findMany({
      where: {
        subCategoryId,
        isActive: true, // Only include active products
        // Only include products that have stock in shops
        batches: {
          some: {
            ShopStock: {
              some: {
                quantity: {
                  gt: 0, // Only batches with available quantity in shops
                },
              },
            },
          },
        },
      },
      include: {
        category: true,
        subCategory: true,
        unitOfMeasure: true,
      },
      orderBy: {
        name: 'asc', // Order by product name alphabetically
      },
    });

    // Return only the product information
    return {
      products,
      count: products.length,
    };
  } catch (error) {
    console.error('Error fetching products by subcategory:', error);
    throw error;
  }
};
// Get all SubCategories by Category ID
const getSubCategoryByNameAndCategory = async () => {
  const subCategories = await prisma.subCategory.findMany({
    orderBy: {
      name: 'asc',
    },
    include: {
      category: true,
    },
  });

  return {
    subCategories,
    count: subCategories.length,
  };
};

// Create SubCategory
const createSubCategory = async (subCategoryBody) => {
  const category = await getCategoryById(subCategoryBody.categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }

  // Direct check with Prisma
  const existingSubCategory = await prisma.subCategory.findFirst({
    where: {
      name: subCategoryBody.name.trim(),
      categoryId: subCategoryBody.categoryId,
    },
  });

  if (existingSubCategory) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'SubCategory name already exists in this category',
    );
  }

  const subCategory = await prisma.subCategory.create({
    data: subCategoryBody,
  });
  return subCategory;
};

// Update SubCategory
const updateSubCategory = async (id, updateBody) => {
  const existingSubCategory = await getSubCategoryById(id);
  if (!existingSubCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'SubCategory not found');
  }

  // Check if name is being updated to an existing subcategory name in the same category
  if (updateBody.name && updateBody.name !== existingSubCategory.name) {
    if (
      await getSubCategoryByNameAndCategory(
        updateBody.name,
        existingSubCategory.categoryId,
      )
    ) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'SubCategory name already exists in this category',
      );
    }
  }

  // If changing category, verify new category exists
  if (
    updateBody.categoryId &&
    updateBody.categoryId !== existingSubCategory.categoryId
  ) {
    const newCategory = await getCategoryById(updateBody.categoryId);
    if (!newCategory) {
      throw new ApiError(httpStatus.NOT_FOUND, 'New category not found');
    }
  }

  const updatedSubCategory = await prisma.subCategory.update({
    where: { id },
    data: updateBody,
    include: {
      category: true,
      products: true,
    },
  });

  return updatedSubCategory;
};

// Delete SubCategory
const deleteSubCategory = async (id) => {
  const existingSubCategory = await getSubCategoryById(id);
  if (!existingSubCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'SubCategory not found');
  }

  await prisma.subCategory.delete({
    where: { id },
  });

  return { message: 'SubCategory deleted successfully' };
};

module.exports = {
  getCategoryById,
  getCategoryByName,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getSubCategoryById,
  getSubCategoryByNameAndCategory,
  getSubCategoriesByCategory,
  getProductsBySubCategoryId,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  getAllSubCategories,
};
