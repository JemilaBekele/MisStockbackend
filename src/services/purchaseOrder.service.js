const httpStatus = require('http-status');
const { PurchaseOrder, User, InventoryItem } = require('../models');
const ApiError = require('../utils/ApiError');

// Create Purchase Order
const createPurchaseOrder = async (purchaseOrderBody) => {
  const { supplierId, orderedBy, items } = purchaseOrderBody;

  // Check if supplier exists
  const supplier = await User.findById(supplierId);
  if (!supplier) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Supplier not found');
  }

  // Check if orderedBy user exists
  const orderedByUser = await User.findById(orderedBy);
  if (!orderedByUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Ordering user not found');
  }

  // Check if all items exist using array iteration
  if (items && Array.isArray(items)) {
    const inventoryItemsPromises = items.map(async (item) => {
      const inventoryItem = await InventoryItem.findById(item.itemId);
      if (!inventoryItem) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          `Item ${item.itemId} not found`,
        );
      }
    });

    // Await all promises to ensure all items exist
    await Promise.all(inventoryItemsPromises);
  }

  // Create the purchase order
  const purchaseOrder = await PurchaseOrder.create(purchaseOrderBody);
  return purchaseOrder;
};

// Get Purchase Order by ID
const getPurchaseOrderById = async (id) => {
  const purchaseOrder = await PurchaseOrder.findById(id)
    .populate('supplierId orderedBy items.itemId')
    .exec();

  if (!purchaseOrder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Purchase order not found');
  }
  return purchaseOrder;
};

// Get all Purchase Orders
const getAllPurchaseOrders = async () => {
  const purchaseOrders = await PurchaseOrder.find()
    .populate('supplierId orderedBy')
    .exec();

  return {
    purchaseOrders,
    count: purchaseOrders.length,
  };
};

// Update Purchase Order
const updatePurchaseOrder = async (id, updateBody) => {
  const purchaseOrder = await getPurchaseOrderById(id);

  // Create a shallow copy of updateBody to avoid direct mutation
  const updatedBody = { ...updateBody };

  // Check if supplier exists
  if (updatedBody.supplierId) {
    const supplier = await User.findById(updatedBody.supplierId);
    if (!supplier) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Supplier not found');
    }
  }

  // Check if orderedBy user exists
  if (updatedBody.orderedBy) {
    const orderedByUser = await User.findById(updatedBody.orderedBy);
    if (!orderedByUser) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Ordering user not found');
    }
  }

  // Check if items exist and update totalPrice using Promise.all for async operations
  if (updatedBody.items && Array.isArray(updatedBody.items)) {
    const inventoryItemsPromises = updatedBody.items.map(async (item) => {
      const inventoryItem = await InventoryItem.findById(item.itemId);
      if (!inventoryItem) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          `Item ${item.itemId} not found`,
        );
      }

      // Create a shallow copy of the item and update its totalPrice
      const updatedItem = { ...item };
      updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;

      return updatedItem; // Return the updated item
    });

    // Wait for all promises to resolve
    const updatedItems = await Promise.all(inventoryItemsPromises);

    // Update the items array in the updatedBody
    updatedBody.items = updatedItems;
  }

  // Update the purchase order
  Object.assign(purchaseOrder, updatedBody);
  await purchaseOrder.save();
  return purchaseOrder;
};

// Delete Purchase Order
const deletePurchaseOrder = async (id) => {
  const purchaseOrder = await getPurchaseOrderById(id);
  await purchaseOrder.remove();
  return { message: 'Purchase order deleted successfully' };
};

module.exports = {
  createPurchaseOrder,
  getPurchaseOrderById,
  getAllPurchaseOrders,
  updatePurchaseOrder,
  deletePurchaseOrder,
};
