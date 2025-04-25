const express = require('express');

const router = express.Router();
const validate = require('../middlewares/validate');
const { inventoryLogValidation } = require('../validations');
const { inventoryLogController } = require('../controllers');
const auth = require('../middlewares/auth');

// Inventory Log Routes

// Create an inventory log
router.post(
  '/api/inventory-log',
  auth,
  validate(inventoryLogValidation.createInventoryLogSchema),
  inventoryLogController.createInventoryLog,
);

// Get all inventory logs
router.get(
  '/api/inventory-logs',
  auth,
  inventoryLogController.getAllInventoryLogs,
);

// Get a single inventory log by ID
router.get(
  '/api/inventory-log/:logId',
  auth,
  inventoryLogController.getInventoryLogById,
);

// Update an inventory log
router.put(
  '/api/inventory-log/:logId',
  auth,
  validate(inventoryLogValidation.updateInventoryLogSchema),
  inventoryLogController.updateInventoryLog,
);

// Delete an inventory log
router.delete(
  '/api/inventory-log/:logId',
  auth,
  inventoryLogController.deleteInventoryLog,
);

module.exports = router;
