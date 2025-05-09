const express = require('express');
const validate = require('../middlewares/validate');
const { revenueCategoryController } = require('../controllers');
const { revenueCategoryValidation } = require('../validations');
const auth = require('../middlewares/auth');

const router = express.Router();

router.post(
  '/api/financial-account',
  auth,
  validate(revenueCategoryValidation.createRevenueCategorySchema),
  revenueCategoryController.createRevenueCategory,
);
// Get all revenue categories
router.get(
  '/api/revenuecategory',
  auth,
  revenueCategoryController.getAllRevenueCategories,
);

// Get revenue category by ID
router.get(
  '/api/revenuecategory/:categoryId',
  auth,
  revenueCategoryController.getRevenueCategoryById,
);

// Update revenue category
router.put(
  '/api/revenuecategory/:categoryId',
  auth,
  validate(revenueCategoryValidation.updateRevenueCategorySchema),
  revenueCategoryController.updateRevenueCategory,
);

// Delete revenue category
router.delete(
  '/api/revenuecategory/:categoryId',
  auth,
  revenueCategoryController.deleteRevenueCategory,
);

module.exports = router;
