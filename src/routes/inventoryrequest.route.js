const express = require('express');

const router = express.Router();
const validate = require('../middlewares/validate');
const { inventoryRequestValidation } = require('../validations');
const { inventoryRequestController } = require('../controllers');
const auth = require('../middlewares/auth');

// Inventory Request Routes

// Create an inventory request
router.post(
  '/api/inventory-request',
  auth,
  validate(inventoryRequestValidation.createInventoryRequestSchema),
  inventoryRequestController.createInventoryRequest,
);

// Get all inventory requests
router.get(
  '/api/inventory-requests',
  auth,
  inventoryRequestController.getAllInventoryRequests,
);

// Get a single inventory request by ID
router.get(
  '/api/inventory-request/:requestId',
  auth,
  inventoryRequestController.getInventoryRequestById,
);

// Update an inventory request
router.put(
  '/api/inventory-request/:requestId',
  auth,
  validate(inventoryRequestValidation.updateInventoryRequestSchema),
  inventoryRequestController.updateInventoryRequest,
);
router.put(
  '/api/inventory-request/approved/:requestId',
  auth,
  validate(inventoryRequestValidation.approvalSchema),
  inventoryRequestController.approveInventoryRequest,
);
// Delete an inventory request
router.delete(
  '/api/inventory-request/:requestId',
  auth,
  inventoryRequestController.deleteInventoryRequest,
);

module.exports = router;
