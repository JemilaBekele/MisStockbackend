const express = require('express');

const router = express.Router();
const validate = require('../middlewares/validate');
const { areaValidation } = require('../validations');
const { areaController } = require('../controllers');
const auth = require('../middlewares/auth');

// Area routes

// Create an area
router.post(
  '/api/area',
  auth, // Add authorization middleware if needed
  validate(areaValidation.createAreaSchema),
  areaController.createArea,
);

// Get an area by ID
router.get(
  '/api/area/:id',
  auth, // Add authorization middleware if needed
  areaController.getAreaById,
);

// Get all areas
router.get(
  '/api/areas',
  auth, // Add authorization middleware if needed
  areaController.getAllAreas,
);

// Update an area
router.put(
  '/api/area/:id',
  auth, // Add authorization middleware if needed
  validate(areaValidation.updateAreaSchema),
  areaController.updateArea,
);

// Delete an area
router.delete(
  '/api/area/:id',
  auth, // Add authorization middleware if needed
  areaController.deleteArea,
);

module.exports = router;
