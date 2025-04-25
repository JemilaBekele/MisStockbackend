const express = require('express');

const router = express.Router();
const validate = require('../middlewares/validate');
const { inventoryItemValidation } = require('../validations');
const { inventoryItemController } = require('../controllers');
const auth = require('../middlewares/auth');

// Inventory Item Routes

// Create an item
router.post(
  '/api/inventory-item',
  auth,
  validate(inventoryItemValidation.createInventoryItemSchema),
  inventoryItemController.createInventoryItem,
);

// Get all items
router.get(
  '/api/inventory-items',
  auth,
  inventoryItemController.getAllInventoryItems,
);

// Get a single item by ID
router.get(
  '/api/inventory-item/:itemId',
  auth,
  inventoryItemController.getInventoryItemById,
);

// Update an item
router.put(
  '/api/inventory-item/:itemId',
  auth,
  validate(inventoryItemValidation.updateInventoryItemSchema),
  inventoryItemController.updateInventoryItem,
);

// Delete an item
router.delete(
  '/api/inventory-item/:itemId',
  auth,
  inventoryItemController.deleteInventoryItem,
);

module.exports = router;
