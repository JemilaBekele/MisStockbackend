const express = require('express');

const router = express.Router();
const validate = require('../middlewares/validate');
const { InventoryCategoryValidation } = require('../validations');
const { InventoryCategoryController } = require('../controllers');
const auth = require('../middlewares/auth');

// Inventory Category Routes

// Create a category
router.post(
  '/api/inventory-category',
  auth,
  validate(InventoryCategoryValidation.createInventoryCategorySchema),
  InventoryCategoryController.createInventoryCategory,
);

// Get all categories
router.get(
  '/api/inventory-categories',
  auth,
  InventoryCategoryController.getAllInventoryCategories,
);

// Get a single category by ID
router.get(
  '/api/inventory-category/:categoryId',
  auth,
  InventoryCategoryController.getInventoryCategoryById,
);

// Update a category
router.put(
  '/api/inventory-category/:categoryId',
  auth,
  validate(InventoryCategoryValidation.updateInventoryCategorySchema),
  InventoryCategoryController.updateInventoryCategory,
);

// Delete a category
router.delete(
  '/api/inventory-category/:categoryId',
  auth,
  InventoryCategoryController.deleteInventoryCategory,
);

module.exports = router;
