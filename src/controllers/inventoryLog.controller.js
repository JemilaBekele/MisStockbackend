const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const inventoryLogService = require('../services');

// Create a new inventory log
const createInventoryLog = catchAsync(async (req, res) => {
  const inventoryLog = await inventoryLogService.createInventoryLog(req.body);
  res.status(httpStatus.CREATED).send({ inventoryLog });
});

// Get all inventory logs
const getAllInventoryLogs = catchAsync(async (req, res) => {
  const result = await inventoryLogService.getAllInventoryLogs();
  res.status(httpStatus.OK).send(result); // { inventoryLogs, count }
});

// Get inventory log by ID
const getInventoryLogById = catchAsync(async (req, res) => {
  const { logId } = req.params;
  const inventoryLog = await inventoryLogService.getInventoryLogById(logId);
  if (!inventoryLog) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Inventory log not found');
  }
  res.status(httpStatus.OK).send({ inventoryLog });
});

// Update inventory log
const updateInventoryLog = catchAsync(async (req, res) => {
  const { logId } = req.params;
  const updatedLog = await inventoryLogService.updateInventoryLog(
    logId,
    req.body,
  );
  res.status(httpStatus.OK).send({ inventoryLog: updatedLog });
});

// Delete inventory log
const deleteInventoryLog = catchAsync(async (req, res) => {
  const { logId } = req.params;
  const response = await inventoryLogService.deleteInventoryLog(logId);
  res.status(httpStatus.OK).send(response); // { message: 'Inventory log deleted successfully' }
});

module.exports = {
  createInventoryLog,
  getAllInventoryLogs,
  getInventoryLogById,
  updateInventoryLog,
  deleteInventoryLog,
};
