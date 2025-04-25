const httpStatus = require('http-status');
const {
  InventoryStock,
  InventoryItem,
  InventoryLocation,
} = require('../models');
const ApiError = require('../utils/ApiError');

// Create Inventory Stock
const createInventoryStock = async (inventoryStockBody) => {
  const { itemId, locationId } = inventoryStockBody;

  // Check if inventory item exists
  const item = await InventoryItem.findById(itemId);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Inventory item not found');
  }

  // Check if location exists
  const location = await InventoryLocation.findById(locationId);
  if (!location) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Location not found');
  }

  // Create the inventory stock
  const inventoryStock = await InventoryStock.create(inventoryStockBody);
  return inventoryStock;
};

// Get Inventory Stock by ID
const getInventoryStockById = async (id) => {
  const inventoryStock = await InventoryStock.findById(id);
  if (!inventoryStock) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Inventory stock not found');
  }
  return inventoryStock;
};

// Get all Inventory Stocks
const getAllInventoryStocks = async () => {
  const inventoryStocks = await InventoryStock.find().sort({ lastUpdated: -1 });
  return {
    inventoryStocks,
    count: inventoryStocks.length,
  };
};

// Update Inventory Stock
const updateInventoryStock = async (id, updateBody) => {
  const inventoryStock = await getInventoryStockById(id);

  // Check if item exists
  if (updateBody.itemId) {
    const item = await InventoryItem.findById(updateBody.itemId);
    if (!item) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Inventory item not found');
    }
  }

  // Check if location exists
  if (updateBody.locationId) {
    const location = await InventoryLocation.findById(updateBody.locationId);
    if (!location) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Location not found');
    }
  }

  // Update the inventory stock
  Object.assign(inventoryStock, updateBody);
  await inventoryStock.save();
  return inventoryStock;
};

// Delete Inventory Stock
const deleteInventoryStock = async (id) => {
  const inventoryStock = await getInventoryStockById(id);
  await inventoryStock.remove();
  return { message: 'Inventory stock deleted successfully' };
};

module.exports = {
  createInventoryStock,
  getInventoryStockById,
  getAllInventoryStocks,
  updateInventoryStock,
  deleteInventoryStock,
};
