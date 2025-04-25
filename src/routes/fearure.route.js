const express = require('express');

const router = express.Router();
const validate = require('../middlewares/validate');
const { fearureValidation } = require('../validations');
const { fearureController } = require('../controllers');
const auth = require('../middlewares/auth');

// fearure routes

// Create an fearure
router.post(
  '/api/fearure',
  auth, // Add authorization middleware if needed
  validate(fearureValidation.createFearureSchema),
  fearureController.createFearure,
);

// Get an fearure by ID
router.get(
  '/api/fearure/:id',
  auth, // Add authorization middleware if needed
  fearureController.getFearureById,
);

// Get all fearures
router.get(
  '/api/fearures',
  auth, // Add authorization middleware if needed
  fearureController.getAllFearures,
);

// Update an fearure
router.put(
  '/api/fearure/:id',
  auth, // Add authorization middleware if needed
  validate(fearureValidation.updateFearureSchema),
  fearureController.updateFearure,
);

// Delete an fearure
router.delete(
  '/api/fearure/:id',
  auth, // Add authorization middleware if needed
  fearureController.deleteFearure,
);

module.exports = router;
