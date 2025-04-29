const httpStatus = require('http-status');
const { InventoryRequest, InventoryItem, Unit, User } = require('../models');
const ApiError = require('../utils/ApiError');

// Create Inventory Request
const createInventoryRequest = async (requestBody) => {
  const { itemId, requestedBy, locationId, approvals } = requestBody;

  // Validate item
  const item = await InventoryItem.findById(itemId);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Inventory item not found');
  }

  // Validate requesting user
  const user = await User.findById(requestedBy);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Requesting user not found');
  }

  // Validate location if provided
  if (locationId) {
    const location = await Unit.findById(locationId);
    if (!location) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Location not found');
    }
  }

  // Validate approvers (if provided)
  if (approvals && approvals.length > 0) {
    await Promise.all(
      approvals.map(async (approval) => {
        const approver = await User.findById(approval.approverId);
        if (!approver) {
          throw new ApiError(
            httpStatus.NOT_FOUND,
            `Approver not found: ${approval.approverId}`,
          );
        }
      }),
    );
  }

  const inventoryRequest = await InventoryRequest.create(requestBody);
  return inventoryRequest;
};

// Get Inventory Request by ID
const getInventoryRequestById = async (id) => {
  const request = await InventoryRequest.findById(id)
    .populate('itemId', 'itemName')
    .populate('requestedBy', 'name')
    .populate('locationId', 'unitNumber')
    .populate('approvals.approverId', 'name');

  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Inventory request not found');
  }
  return request;
};

// Get all Inventory Requests
const getAllInventoryRequests = async () => {
  const requests = await InventoryRequest.find()
    .sort({ createdAt: -1 })
    .populate('itemId', 'itemName')
    .populate('requestedBy', 'name')
    .populate('locationId', 'unitNumber')
    .populate('approvals.approverId', 'name');

  return {
    requests,
    count: requests.length,
  };
};

// Update Inventory Request
const updateInventoryRequest = async (id, updateBody) => {
  const request = await getInventoryRequestById(id);

  if (updateBody.itemId) {
    const item = await InventoryItem.findById(updateBody.itemId);
    if (!item) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Inventory item not found');
    }
  }

  if (updateBody.requestedBy) {
    const user = await User.findById(updateBody.requestedBy);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Requesting user not found');
    }
  }

  if (updateBody.locationId) {
    const location = await Unit.findById(updateBody.locationId);
    if (!location) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Location not found');
    }
  }

  // Optional: validate updated approvals
  if (updateBody.approvals) {
    const approverChecks = updateBody.approvals.map(async (approval) => {
      const approver = await User.findById(approval.approverId);
      if (!approver) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          `Approver not found: ${approval.approverId}`,
        );
      }
    });
    await Promise.all(approverChecks);
  }

  Object.assign(request, updateBody);
  await request.save();
  return request;
};

// Delete Inventory Request
const deleteInventoryRequest = async (id) => {
  const request = await getInventoryRequestById(id);
  await request.remove();
  return { message: 'Inventory request deleted successfully' };
};

module.exports = {
  createInventoryRequest,
  getInventoryRequestById,
  getAllInventoryRequests,
  updateInventoryRequest,
  deleteInventoryRequest,
};
