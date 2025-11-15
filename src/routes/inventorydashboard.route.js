const express = require('express');

const router = express.Router();
const { inventoryDashboardController } = require('../controllers');
const auth = require('../middlewares/auth');

// Inventory Dashboard Routes

// Get comprehensive inventory dashboard data
router.get(
  '/api/inventory-dashboard/dashboard',
  auth,
  inventoryDashboardController.getInventoryDashboard,
);

// Get batch expiration details
router.get(
  '/api/inventory-dashboard/expiring-batches',
  auth,
  inventoryDashboardController.getBatchExpirationDetails,
);

// Get stock summary by location
router.get(
  '/api/inventory-dashboard/location-summary',
  auth,
  inventoryDashboardController.getStockSummaryByLocation,
);

module.exports = router;
