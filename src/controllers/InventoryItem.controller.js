const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const inventoryItemService = require('../services');

// Create a new inventory item
const createInventoryItem = catchAsync(async (req, res) => {
  const inventoryItem = await inventoryItemService.createInventoryItem(
    req.body,
  );
  res.status(httpStatus.CREATED).send({ inventoryItem });
});

// Get all inventory items
const getAllInventoryItems = catchAsync(async (req, res) => {
  const result = await inventoryItemService.getAllInventoryItems();
  res.status(httpStatus.OK).send(result); // { inventoryItems, count }
});

// Get inventory item by ID
const getInventoryItemById = catchAsync(async (req, res) => {
  const { itemId } = req.params;
  const inventoryItem = await inventoryItemService.getInventoryItemById(itemId);
  if (!inventoryItem) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Inventory item not found');
  }
  res.status(httpStatus.OK).send({ inventoryItem });
});

// Update inventory item
const updateInventoryItem = catchAsync(async (req, res) => {
  const { itemId } = req.params;
  const updatedItem = await inventoryItemService.updateInventoryItem(
    itemId,
    req.body,
  );
  res.status(httpStatus.OK).send({ inventoryItem: updatedItem });
});

// Delete inventory item
const deleteInventoryItem = catchAsync(async (req, res) => {
  const { itemId } = req.params;
  const response = await inventoryItemService.deleteInventoryItem(itemId);
  res.status(httpStatus.OK).send(response); // { message: 'Inventory item deleted successfully' }
});

module.exports = {
  createInventoryItem,
  getAllInventoryItems,
  getInventoryItemById,
  updateInventoryItem,
  deleteInventoryItem,
};
