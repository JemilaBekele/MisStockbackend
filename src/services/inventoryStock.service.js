const httpStatus = require('http-status');
const {
  InventoryStock,
  InventoryItem,
  Unit,
  InventoryLog,
  User,
} = require('../models');
const ApiError = require('../utils/ApiError');

// Create Inventory Stock
const createInventoryStock = async (inventoryStockBody, requestUserId) => {
  const { itemId, locationId, userId = requestUserId } = inventoryStockBody;

  // Validate all references exist
  const [item, location, user] = await Promise.all([
    InventoryItem.findById(itemId),
    Unit.findById(locationId),
    User.findById(userId),
  ]);

  if (!item)
    throw new ApiError(httpStatus.NOT_FOUND, 'Inventory item not found');
  if (!location) throw new ApiError(httpStatus.NOT_FOUND, 'Location not found');
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

  // Create stock record
  const inventoryStock = await InventoryStock.create({
    ...inventoryStockBody,
    userId,
  });

  // Create detailed log entry
  const logEntry = {
    itemId,
    action: inventoryStockBody.quantity > 0 ? 'Recorded' : 'Adjusted',
    userId,
    quantityChanged: inventoryStock.quantity,
    timestamp: new Date(),
    notes:
      `${inventoryStock.quantity} units of ${item.itemName} (${
        item.sku || item.id
      }) ` +
      `recorded at ${location.name} (Floor ${location.floor}) ` +
      `with status: ${inventoryStock.status}`,
  };

  await InventoryLog.create(logEntry);

  // Update item status if different from stock status
  if (item.status !== inventoryStock.status) {
    await InventoryItem.findByIdAndUpdate(
      itemId,
      { status: inventoryStock.status },
      { new: true },
    );
  }

  return inventoryStock;
};

// Get Inventory Stock by ID
const getInventoryStockById = async (id) => {
  const inventoryStock = await InventoryStock.findById(id)
    .populate('itemId', 'itemName') // Populate InventoryItem with itemName and categoryId
    .populate('locationId', 'name')
    .exec();
  if (!inventoryStock) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Inventory stock not found');
  }
  return inventoryStock;
};

// Get all Inventory Stocks
const getAllInventoryStocks = async () => {
  const inventoryStocks = await InventoryStock.find()
    .sort({ lastUpdated: -1 })
    .populate('itemId', 'itemName') // Populate InventoryItem with itemName and categoryId
    .populate('locationId', 'name'); // Populate InventoryLocation with locationName
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
    const location = await Unit.findById(updateBody.locationId);
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
