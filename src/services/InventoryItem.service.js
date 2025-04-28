const httpStatus = require('http-status');
const {
  InventoryItem,
  InventoryCategory,
  Unit,
  User,
  PurchaseOrder,
} = require('../models');
const ApiError = require('../utils/ApiError');

// Create Inventory Item
const createInventoryItem = async (inventoryItemBody) => {
  const { categoryId, locationId, assignedUserId, purchaseId } =
    inventoryItemBody;

  // Check if category exists
  const category = await InventoryCategory.findById(categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Inventory category not found');
  }

  // Check if location exists
  const location = await Unit.findById(locationId);
  if (!location) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Location not found');
  }

  // Check if assigned user exists
  if (assignedUserId) {
    const user = await User.findById(assignedUserId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Assigned user not found');
    }
  }

  // Check if purchase order exists
  if (purchaseId) {
    const purchaseOrder = await PurchaseOrder.findById(purchaseId);
    if (!purchaseOrder) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Purchase order not found');
    }
  }

  // Create the inventory item
  const inventoryItem = await InventoryItem.create(inventoryItemBody);
  return inventoryItem;
};

// Get Inventory Item by ID
const getInventoryItemById = async (id) => {
  const inventoryItem = await InventoryItem.findById(id)
    .populate('categoryId', 'name') // Populate InventoryCategory, only fetching the categoryName
    .populate('assignedUserId', 'name') // Populate User, only fetching the user's name
    .populate('locationId', 'unitNumber')
    .exec();
  if (!inventoryItem) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Inventory item not found');
  }
  return inventoryItem;
};

// Get all Inventory Items
const getAllInventoryItems = async () => {
  const inventoryItems = await InventoryItem.find()
    .sort({ itemName: 1 })
    .populate('categoryId', 'name') // Populate InventoryCategory, only fetching the categoryName
    .populate('assignedUserId', 'name') // Populate User, only fetching the user's name
    .populate('locationId', 'unitNumber'); // Populate Location, only fetching the locationName
  return {
    inventoryItems,
    count: inventoryItems.length,
  };
};

// Update Inventory Item
const updateInventoryItem = async (id, updateBody) => {
  const inventoryItem = await getInventoryItemById(id);

  // Check if category exists
  if (updateBody.categoryId) {
    const category = await InventoryCategory.findById(updateBody.categoryId);
    if (!category) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Inventory category not found');
    }
  }

  // Check if location exists
  if (updateBody.locationId) {
    const location = await Unit.findById(updateBody.locationId);
    if (!location) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Location not found');
    }
  }

  // Check if assigned user exists
  if (updateBody.assignedUserId) {
    const user = await User.findById(updateBody.assignedUserId);
    if (!user) {
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

  // Update the inventory item
  Object.assign(inventoryItem, updateBody);
  await inventoryItem.save();
  return inventoryItem;
};

// Delete Inventory Item
const deleteInventoryItem = async (id) => {
  const inventoryItem = await getInventoryItemById(id);
  await inventoryItem.remove();
  return { message: 'Inventory item deleted successfully' };
};

module.exports = {
  createInventoryItem,
  getInventoryItemById,
  getAllInventoryItems,
  updateInventoryItem,
  deleteInventoryItem,
};
