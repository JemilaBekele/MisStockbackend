const httpStatus = require('http-status');
const {
  InventoryLog,
  InventoryItem,
  User,
  PurchaseOrder,
} = require('../models');
const ApiError = require('../utils/ApiError');

// Create Inventory Log
const createInventoryLog = async (inventoryLogBody) => {
  const { itemId, userId, assignedTo, purchaseId } = inventoryLogBody;

  // Check if item exists
  const inventoryItem = await InventoryItem.findById(itemId);
  if (!inventoryItem) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Inventory item not found');
  }

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Check if assigned user exists (if provided)
  if (assignedTo) {
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Assigned user not found');
    }
  }

  // Check if purchase order exists (if provided)
  if (purchaseId) {
    const purchaseOrder = await PurchaseOrder.findById(purchaseId);
    if (!purchaseOrder) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Purchase order not found');
    }
  }

  // Create the inventory log
  const inventoryLog = await InventoryLog.create(inventoryLogBody);
  return inventoryLog;
};

// Get Inventory Log by ID
const getInventoryLogById = async (id) => {
  const inventoryLog = await InventoryLog.findById(id)
    .populate('itemId', 'itemName') // Populate InventoryItem with itemName and categoryId
    .populate('userId', 'name') // Populate User with name
    .populate('assignedTo', 'name') // Populate User with assigned person's name
    .populate('purchaseId', 'status')
    .exec();
  if (!inventoryLog) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Inventory log not found');
  }
  return inventoryLog;
};

// Get all Inventory Logs
const getAllInventoryLogs = async () => {
  const inventoryLogs = await InventoryLog.find()
    .sort({ timestamp: -1 })
    .populate('itemId', 'itemName') // Populate InventoryItem with itemName and categoryId
    .populate('userId', 'name') // Populate User with name
    .populate('assignedTo', 'name') // Populate User with assigned person's name
    .populate('purchaseId', 'status'); // Populate PurchaseOrder with supplierId and orderedBy
  return {
    inventoryLogs,
    count: inventoryLogs.length,
  };
};

// Update Inventory Log
const updateInventoryLog = async (id, updateBody) => {
  const inventoryLog = await getInventoryLogById(id);

  // Check if item exists
  if (updateBody.itemId) {
    const inventoryItem = await InventoryItem.findById(updateBody.itemId);
    if (!inventoryItem) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Inventory item not found');
    }
  }

  // Check if user exists
  if (updateBody.userId) {
    const user = await User.findById(updateBody.userId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
  }

  // Check if assigned user exists
  if (updateBody.assignedTo) {
    const assignedUser = await User.findById(updateBody.assignedTo);
    if (!assignedUser) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Assigned user not found');
    }
  }

  // Check if purchase order exists
  if (updateBody.purchaseId) {
    const purchaseOrder = await PurchaseOrder.findById(updateBody.purchaseId);
    if (!purchaseOrder) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Purchase order not found');
    }
  }

  // Update the inventory log
  Object.assign(inventoryLog, updateBody);
  await inventoryLog.save();
  return inventoryLog;
};

// Delete Inventory Log
const deleteInventoryLog = async (id) => {
  const inventoryLog = await getInventoryLogById(id);
  await inventoryLog.remove();
  return { message: 'Inventory log deleted successfully' };
};

module.exports = {
  createInventoryLog,
  getInventoryLogById,
  getAllInventoryLogs,
  updateInventoryLog,
  deleteInventoryLog,
};
