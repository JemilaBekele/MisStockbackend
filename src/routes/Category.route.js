const express = require('express');

const router = express.Router();
const { categoryController } = require('../controllers');
const auth = require('../middlewares/auth');
// const checkPermission = require('../middlewares/permission.middleware');

// Category Routes
router.post(
  '/api/categories',
  auth,
  //   checkPermission('CREATE_CATEGORY'),
  categoryController.createCategory,
);

router.get(
  '/api/categories/:id',
  auth,
  //   checkPermission('VIEW_CATEGORY'),
  categoryController.getCategory,
);

router.get(
  '/api/categories',
  //   checkPermission('VIEW_CATEGORY'),
  categoryController.getCategories,
);

router.put(
  '/api/categories/:id',
  auth,
  //   checkPermission('UPDATE_CATEGORY'),
  categoryController.updateCategory,
);

router.delete(
  '/api/categories/:id',
  auth,
  //   checkPermission('DELETE_CATEGORY'),
  categoryController.deleteCategory,
);

// SubCategory Routes
router.post(
  '/api/subcategories',
  auth,
  //   checkPermission('CREATE_SUBCATEGORY'),
  categoryController.createSubCategory,
);

router.get(
  '/api/subcategories/:id',
  auth,
  //   checkPermission('VIEW_SUBCATEGORY'),
  categoryController.getSubCategory,
);
router.get(
  '/api/products/subcategory/all/:subCategoryId',
  auth,
  // checkPermission('VIEW_PRODUCTS'),
  categoryController.getProductsBySubCategory,
);

// Get products by subcategory name and category ID
router.get(
  '/api/products/category/:categoryId/subcategory',
  auth,
  // checkPermission('VIEW_PRODUCTS'),
  categoryController.getProductsBySubCategoryName,
);
router.get(
  '/api/subcategories',
  //   checkPermission('VIEW_SUBCATEGORY'),
  categoryController.getSubCategoriesByCategory,
);
router.get(
  '/api/subcategories/veiw/all/find',
  //   checkPermission('VIEW_SUBCATEGORY'),
  categoryController.getAllSubCategories,
);

router.put(
  '/api/subcategories/:id',
  auth,
  //   checkPermission('UPDATE_SUBCATEGORY'),
  categoryController.updateSubCategory,
);

router.delete(
  '/api/subcategories/:id',
  auth,
  //   checkPermission('DELETE_SUBCATEGORY'),
  categoryController.deleteSubCategory,
);

module.exports = router;
