const express = require('express');

const router = express.Router();

const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');
const { leaseValidation } = require('../validations');
const { leaseController } = require('../controllers');

// Lease routes

// Create a lease
router.post(
  '/api/lease',
  auth,
  validate(leaseValidation.createLeaseSchema),
  leaseController.createLease,
);

// Get a lease by ID
router.get('/api/lease/:id', auth, leaseController.getLease);

// Get all leases with optional query filters
router.get('/api/leases', auth, leaseController.getLeases);

// Update a lease
router.put(
  '/api/lease/:id',
  auth,
  validate(leaseValidation.updateLeaseSchema),
  leaseController.updateLease,
);

// Terminate a lease
router.post(
  '/api/lease/:id/terminate',
  auth,
  validate(leaseValidation.terminateLeaseSchema),
  leaseController.terminateLease,
);

// Delete a lease
router.delete('/api/lease/:id', auth, leaseController.deleteLease);

module.exports = router;
