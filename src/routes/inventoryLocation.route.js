const express = require('express');

const router = express.Router();
const validate = require('../middlewares/validate');
const { inventoryLocationValidation } = require('../validations');
const { inventoryLocationController } = require('../controllers');
const auth = require('../middlewares/auth');

// Inventory Location Routes

// Create an inventory location
router.post(
  '/api/inventory-location',
  auth,
  validate(inventoryLocationValidation.createInventoryLocationSchema),
  inventoryLocationController.createInventoryLocation,
);

// Get all inventory locations
router.get(
  '/api/inventory-locations',
  auth,
  inventoryLocationController.getAllInventoryLocations,
);

// Get a single inventory location by ID
router.get(
  '/api/inventory-location/:locationId',
  auth,
  inventoryLocationController.getInventoryLocationById,
);

// Update an inventory location
router.put(
  '/api/inventory-location/:locationId',
  auth,
  validate(inventoryLocationValidation.updateInventoryLocationSchema),
  inventoryLocationController.updateInventoryLocation,
);

// Delete an inventory location
router.delete(
  '/api/inventory-location/:locationId',
  auth,
  inventoryLocationController.deleteInventoryLocation,
);

module.exports = router;
