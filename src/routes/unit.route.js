const express = require('express');

const router = express.Router();
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');
const { unitValidation } = require('../validations');
const { unitController } = require('../controllers');

// Create a unit getAll
router.post(
  '/api/unit',
  auth,
  validate(unitValidation.createUnitSchema),
  unitController.createUnit,
);

// Get a unit by ID
router.get('/api/unit/:id', auth, unitController.getUnitById);

// Get all units
router.get('/api/units', auth, unitController.getAllUnits);

router.get('/api/units/store', auth, unitController.getAllstore);

// Get units by Area ID
router.get('/api/units/by-area/:areaId', auth, unitController.getUnitsByArea);

// Update a unit
router.put(
  '/api/unit/:id',
  auth,
  validate(unitValidation.updateUnitSchema),
  unitController.updateUnit,
);

// Delete a unit
router.delete('/api/unit/:id', auth, unitController.deleteUnit);

module.exports = router;
