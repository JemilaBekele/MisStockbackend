const express = require('express');

const router = express.Router();
const validate = require('../middlewares/validate');
const { purchaseOrderValidation } = require('../validations');
const { purchaseOrderController } = require('../controllers');
const auth = require('../middlewares/auth');

// Purchase Order Routes

// Create a purchase order
router.post(
  '/api/purchase-order',
  auth,
  validate(purchaseOrderValidation.createPurchaseOrderSchema),
  purchaseOrderController.createPurchaseOrder,
);

// Get all purchase orders
router.get(
  '/api/purchase-orders',
  auth,
  purchaseOrderController.getAllPurchaseOrders,
);

// Get a single purchase order by ID
router.get(
  '/api/purchase-order/:orderId',
  auth,
  purchaseOrderController.getPurchaseOrderById,
);

// Update a purchase order
router.put(
  '/api/purchase-order/:orderId',
  auth,
  validate(purchaseOrderValidation.updatePurchaseOrderSchema),
  purchaseOrderController.updatePurchaseOrder,
);

// Delete a purchase order
router.delete(
  '/api/purchase-order/:orderId',
  auth,
  purchaseOrderController.deletePurchaseOrder,
);

module.exports = router;
