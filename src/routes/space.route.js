const express = require('express');
const router = express.Router();
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');
const { spaceValidation } = require('../validations');
const { spaceController } = require('../controllers');

// Create a space
router.post(
  '/api/space',
  auth,
  validate(spaceValidation.createSpaceSchema),
  spaceController.createSpace
);

// Get a space by ID
router.get(
  '/api/space/:id',
  auth,
  spaceController.getSpaceById
);

// Get all spaces
router.get(
  '/api/spaces',
  auth,
  spaceController.getAllSpaces
);

// Get spaces by Area ID
router.get(
  '/api/spaces/by-area/:areaId',
  auth,
  spaceController.getSpacesByArea
);

// Update a space
router.put(
  '/api/space/:id',
  auth,
  validate(spaceValidation.updateSpaceSchema),
  spaceController.updateSpace
);

// Delete a space
router.delete(
  '/api/space/:id',
  auth,
  spaceController.deleteSpace
);

module.exports = router;
