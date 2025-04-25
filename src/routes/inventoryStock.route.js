const express = require('express');

const router = express.Router();
const validate = require('../middlewares/validate');
const { inventoryStockValidation } = require('../validations');
const { inventoryStockController } = require('../controllers');
const auth = require('../middlewares/auth');

// Inventory Stock Routes

// Create an inventory stock
router.post(
  '/api/inventory-stock',
  auth,
  validate(inventoryStockValidation.createInventoryStockSchema),
  inventoryStockController.createInventoryStock,
);

// Get all inventory stocks
router.get(
  '/api/inventory-stocks',
  auth,
  inventoryStockController.getAllInventoryStocks,
);

// Get a single inventory stock by ID
router.get(
  '/api/inventory-stock/:stockId',
  auth,
  inventoryStockController.getInventoryStockById,
);

// Update an inventory stock
router.put(
  '/api/inventory-stock/:stockId',
  auth,
  validate(inventoryStockValidation.updateInventoryStockSchema),
  inventoryStockController.updateInventoryStock,
);

// Delete an inventory stock
router.delete(
  '/api/inventory-stock/:stockId',
  auth,
  inventoryStockController.deleteInventoryStock,
);

module.exports = router;
