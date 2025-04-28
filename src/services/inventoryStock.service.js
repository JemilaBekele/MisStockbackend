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
      `${inventoryStock.quantity} units of ${item.itemName} (${item?.stockCode}) ` +
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
    .populate('locationId', 'unitNumber')
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
    .populate('locationId', 'unitNumber'); // Populate InventoryLocation with locationName
  return {
    inventoryStocks,
    count: inventoryStocks.length,
  };
};

// Update Inventory Stock
const updateInventoryStock = async (id, updateBody) => {
  const inventoryStock = await getInventoryStockById(id);
  if (!inventoryStock) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Inventory stock not found');
  }

  // Check if item exists (if itemId is changing)
  if (updateBody.itemId) {
    const item = await InventoryItem.findById(updateBody.itemId);
    if (!item) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Inventory item not found');
    }
  }

  // Check if location exists (if locationId is changing)
  if (updateBody.locationId) {
    const location = await Unit.findById(updateBody.locationId);
    if (!location) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Location not found');
    }
  }

  const previousQuantity = inventoryStock.quantity;

  // Update the inventory stock
  Object.assign(inventoryStock, updateBody);
  await inventoryStock.save();

  // After saving, create a log entry
  const item = await InventoryItem.findById(inventoryStock.itemId);
  const location = await Unit.findById(inventoryStock.locationId);

  const logEntry = {
    itemId: inventoryStock.itemId,
    action: 'Updated',
    userId: inventoryStock.userId,
    quantityChanged: inventoryStock.quantity - previousQuantity, // difference
    timestamp: new Date(),
    notes:
      `${item?.itemName ?? 'Unknown Item'} stock updated at ` +
      `${location?.unitNumber ?? 'Unknown Location'} (type ${
        location?.type ?? '-'
      }) ` +
      `to ${inventoryStock.quantity} units with status: ${inventoryStock.status}`,
  };

  await InventoryLog.create(logEntry);

  // Optionally: Update the item status too, like in createInventoryStock
  if (item && item.status !== inventoryStock.status) {
    await InventoryItem.findByIdAndUpdate(
      inventoryStock.itemId,
      { status: inventoryStock.status },
      { new: true },
    );
  }

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
