const httpStatus = require('http-status');
const { Lease } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a lease
 * @param {Object} leaseBody
 * @returns {Promise<Lease>}
 */

const generatePaymentSchedule = (
  startDate,
  endDate,
  rentAmount,
  paymentCycle,
) => {
  const schedule = [];
  let currentDate = new Date(startDate);

  while (!endDate || currentDate < endDate) {
    const dueDate = new Date(currentDate);
    let nextDate;

    switch (paymentCycle) {
      case 'Monthly':
        nextDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
        break;
      case 'Quarterly':
        nextDate = new Date(currentDate.setMonth(currentDate.getMonth() + 3));
        break;
      case 'Annually':
        nextDate = new Date(
          currentDate.setFullYear(currentDate.getFullYear() + 1),
        );
        break;
      default:
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid payment cycle');
    }

    if (endDate && nextDate > endDate) {
      break;
    }

    schedule.push({
      dueDate,
      amount: rentAmount,
      status: 'Unpaid',
    });

    currentDate = nextDate;
  }

  return schedule;
};

const createLease = async (leaseBody) => {
  // Validate overlapping leases for the same unit
  const existingLease = await Lease.findOne({
    unitId: leaseBody.unitId,
    status: { $in: ['Active', 'Pending'] },
    $or: [
      {
        startDate: { $lte: leaseBody.endDate },
        endDate: { $gte: leaseBody.startDate },
      },
      { endDate: null, startDate: { $lte: leaseBody.endDate } }, // Open-ended lease
    ],
  });

  if (existingLease) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Unit already has an active/pending lease for this period',
    );
  }

  // Auto-generate payment schedule if not provided
  if (!leaseBody.paymentSchedule) {
    // eslint-disable-next-line no-param-reassign
    leaseBody.paymentSchedule = generatePaymentSchedule(
      leaseBody.startDate,
      leaseBody.endDate,
      leaseBody.rentAmount,
      leaseBody.paymentCycle,
    );
  }

  return Lease.create(leaseBody);
};

/**
 * Get lease by ID
 * @param {ObjectId} id
 * @returns {Promise<Lease>}
 */
const getLeaseById = async (id) => {
  return Lease.findById(id).populate('tenantId unitId createdBy');
};

/**
 * Query leases with filters
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryLeases = async (filter, options) => {
  const leases = await Lease.paginate(filter, options);
  return leases;
};

/**
 * Get all active leases for a property
 * @param {ObjectId} propertyId
 * @returns {Promise<Lease[]>}
 */
const getActiveLeasesByProperty = async (propertyId) => {
  return Lease.find({
    status: 'Active',
    'unitId.propertyId': propertyId,
  }).populate('tenantId unitId');
};

/**
 * Update lease by ID
 * @param {ObjectId} leaseId
 * @param {Object} updateBody
 * @returns {Promise<Lease>}
 */
const updateLease = async (leaseId, updateBody) => {
  const lease = await getLeaseById(leaseId);
  if (!lease) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lease not found');
  }

  // Prevent modifying critical fields if lease is active
  if (lease.status === 'Active') {
    const restrictedFields = ['unitId', 'tenantId', 'startDate', 'rentAmount'];
    restrictedFields.forEach((field) => {
      if (updateBody[field]) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          `Cannot modify ${field} for an active lease. Create a new lease instead.`,
        );
      }
    });
  }

  Object.assign(lease, updateBody);
  await lease.save();
  return lease;
};

/**
 * Terminate lease
 * @param {ObjectId} leaseId
 * @param {Date} terminationDate
 * @param {string} reason
 * @returns {Promise<Lease>}
 */
const terminateLease = async (leaseId, terminationDate, reason) => {
  const lease = await getLeaseById(leaseId);
  if (!lease) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lease not found');
  }

  lease.status = 'Terminated';
  lease.terminationDate = terminationDate;
  lease.customTerms.push(`Termination Reason: ${reason}`);

  await lease.save();
  return lease;
};

/**
 * Delete lease by ID
 * @param {ObjectId} leaseId
 * @returns {Promise<Lease>}
 */
const deleteLease = async (leaseId) => {
  const lease = await getLeaseById(leaseId);
  if (!lease) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lease not found');
  }

  if (lease.status === 'Active') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot delete an active lease');
  }

  await lease.remove();
  return { message: 'Lease deleted successfully' };
};

// Helper: Generate payment schedule

module.exports = {
  createLease,
  getLeaseById,
  queryLeases,
  getActiveLeasesByProperty,
  updateLease,
  terminateLease,
  deleteLease,
};
