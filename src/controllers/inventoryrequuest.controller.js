const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { inventoryRequestService } = require('../services');

// Create a new inventory request
const createInventoryRequest = catchAsync(async (req, res) => {
  const inventoryRequest = await inventoryRequestService.createInventoryRequest(
    req.body,
  );
  res.status(httpStatus.CREATED).send({ inventoryRequest });
});

// Get all inventory requests
const getAllInventoryRequests = catchAsync(async (req, res) => {
  const result = await inventoryRequestService.getAllInventoryRequests();
  res.status(httpStatus.OK).send(result); // { requests, count }
});

// Get inventory request by ID
const getInventoryRequestById = catchAsync(async (req, res) => {
  const { requestId } = req.params;
  const inventoryRequest =
    await inventoryRequestService.getInventoryRequestById(requestId);
  if (!inventoryRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Inventory request not found');
  }
  res.status(httpStatus.OK).send({ inventoryRequest });
});

// Update inventory request
const updateInventoryRequest = catchAsync(async (req, res) => {
  const { requestId } = req.params;
  const updatedRequest = await inventoryRequestService.updateInventoryRequest(
    requestId,
    req.body,
  );
  res.status(httpStatus.OK).send({ inventoryRequest: updatedRequest });
});

// Delete inventory request
const deleteInventoryRequest = catchAsync(async (req, res) => {
  const { requestId } = req.params;
  const response = await inventoryRequestService.deleteInventoryRequest(
    requestId,
  );
  res.status(httpStatus.OK).send(response); // { message: 'Inventory request deleted successfully' }
});

module.exports = {
  createInventoryRequest,
  getAllInventoryRequests,
  getInventoryRequestById,
  updateInventoryRequest,
  deleteInventoryRequest,
};
