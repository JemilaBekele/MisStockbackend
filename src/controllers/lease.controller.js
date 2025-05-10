const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { leaseService } = require('../services');
const ApiError = require('../utils/ApiError');

/**
 * Create a new lease
 */
const createLease = catchAsync(async (req, res) => {
  const lease = await leaseService.createLease(req.body);
  res.status(httpStatus.CREATED).send({
    success: true,
    message: 'Lease created successfully',
    data: lease,
  });
});

/**
 * Get lease by ID
 */
const getLease = catchAsync(async (req, res) => {
  const lease = await leaseService.getLeaseById(req.params.leaseId);
  if (!lease) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lease not found');
  }
  res.status(httpStatus.OK).send({
    success: true,
    data: lease,
  });
});

/**
 * Get paginated list of leases
 */
const getLeases = catchAsync(async (req, res) => {
  const leases = await leaseService.getLeases();
  res.status(httpStatus.OK).json(leases);
});

/**
 * Get active leases for a property
 */
const getPropertyActiveLeases = catchAsync(async (req, res) => {
  const leases = await leaseService.getActiveLeasesByProperty(
    req.params.propertyId,
  );
  res.status(httpStatus.OK).send({
    success: true,
    count: leases.length,
    data: leases,
  });
});

/**
 * Update lease details
 */
const updateLease = catchAsync(async (req, res) => {
  const lease = await leaseService.updateLease(req.params.leaseId, req.body);
  res.status(httpStatus.OK).send({
    success: true,
    message: 'Lease updated successfully',
    data: lease,
  });
});

/**
 * Terminate a lease
 */
const terminateLease = catchAsync(async (req, res) => {
  const { terminationDate, reason } = req.body;
  const lease = await leaseService.terminateLease(
    req.params.leaseId,
    terminationDate,
    reason,
  );
  res.status(httpStatus.OK).send({
    success: true,
    message: 'Lease terminated successfully',
    data: lease,
  });
});

/**
 * Delete a lease
 */
const deleteLease = catchAsync(async (req, res) => {
  await leaseService.deleteLease(req.params.leaseId);
  res.status(httpStatus.OK).send({
    success: true,
    message: 'Lease deleted successfully',
  });
});

module.exports = {
  createLease,
  getLease,
  getLeases,
  getPropertyActiveLeases,
  updateLease,
  terminateLease,
  deleteLease,
};
