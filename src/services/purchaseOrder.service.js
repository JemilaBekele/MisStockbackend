const httpStatus = require('http-status');
const {
  InventoryLog,
  InventoryStock,
  PurchaseOrder,
  User,
  Unit,
  InventoryItem,
} = require('../models');
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

  // Check if all items exist
  if (items && Array.isArray(items)) {
    await Promise.all(
      items.map(async (item) => {
        const inventoryItem = await InventoryItem.findById(item.itemId);
        if (!inventoryItem) {
          throw new ApiError(
            httpStatus.NOT_FOUND,
            `Item ${item.itemId} not found`,
          );
        }
        // Check if location exists if provided
        if (item.locationId) {
          const location = await Unit.findById(item.locationId);
          if (!location) {
            throw new ApiError(
              httpStatus.NOT_FOUND,
              `Location ${item.locationId} not found`,
            );
          }
        }
      }),
    );
  }

  // Create the purchase order
  const purchaseOrder = await PurchaseOrder.create(purchaseOrderBody);

  // Update inventory stocks
  const stockUpdates = items.map(async (item) => {
    const inventoryStock = await InventoryStock.findOne({
      itemId: item.itemId,
      locationId: item.locationId,
    });

    if (inventoryStock) {
      // Update existing stock
      inventoryStock.quantity += item.quantity;
      inventoryStock.lastUpdated = new Date();
      inventoryStock.userId = orderedBy; // Set the user who ordered
      await inventoryStock.save();
    } else {
      // Create new stock record
      await InventoryStock.create({
        itemId: item.itemId,
        locationId: item.locationId,
        quantity: item.quantity,
        userId: orderedBy, // Set the user who ordered
        status: 'Available',
      });
    }
  });

  await Promise.all(stockUpdates);

  // Create inventory logs
  // Create inventory logs with comprehensive status tracking
  const logEntries = items.map((item) => {
    const actionMap = {
      Pending: 'Recorded',
      'Partially Received': 'Partially Received',
      Received: 'Received',
      Cancelled: 'Cancelled',
    };

    const quantityMap = {
      Pending: 0, // No actual quantity received yet
      'Partially Received': item.quantity * 0.5, // Example - adjust based on actual received qty
      Received: item.quantity,
      Cancelled: 0,
    };

    const noteTemplates = {
      Pending: `Item recorded (pending) in PO ${purchaseOrder.shortCode}`,
      'Partially Received': `${item.quantity} units partially received from PO ${purchaseOrder.shortCode}`,
      Received: `All ${item.quantity} units received from PO ${purchaseOrder.shortCode}`,
      Cancelled: `Receipt cancelled for PO ${purchaseOrder.shortCode}`,
    };

    return InventoryLog.create({
      itemId: item.itemId,
      action: actionMap[purchaseOrder.status],
      userId: orderedBy,
      purchaseId: purchaseOrder.id,
      quantityChanged: quantityMap[purchaseOrder.status],
      timestamp: new Date(),
      notes: noteTemplates[purchaseOrder.status],
      status: purchaseOrder.status, // Optional: store PO status in log for filtering
    });
  });

  await Promise.all(logEntries);

  // Update InventoryItem status to 'Available' if not already
  const statusUpdates = items.map((item) =>
    InventoryItem.findByIdAndUpdate(
      item.itemId,
      {
        status: 'Available',
        lastUpdatedBy: orderedBy, // Track who last updated the item
      },
      { new: true },
    ),
  );

  await Promise.all(statusUpdates);

  return purchaseOrder;
};

// Get Purchase Order by ID
const getPurchaseOrderById = async (id) => {
  const purchaseOrder = await PurchaseOrder.findById(id)
    .populate('supplierId', 'name email') // Populate supplierId with name and email from User
    .populate('orderedBy', 'name email') // Populate orderedBy with name and email from User
    .populate('items.itemId', 'itemName') // Populate itemId in items with itemName and categoryId from InventoryItem
    .populate('items.locationId', 'locationName') // Populate locationId in items with locationName from Location
    .exec();

  if (!purchaseOrder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Purchase order not found');
  }
  return purchaseOrder;
};

// Get all Purchase Orders
const getAllPurchaseOrders = async () => {
  const purchaseOrders = await PurchaseOrder.find()
    .populate('supplierId', 'name email') // Populate supplierId with name and email from User
    .populate('orderedBy', 'name email') // Populate orderedBy with name and email from User
    .populate('items.itemId', 'itemName') // Populate itemId in items with itemName and categoryId from InventoryItem
    .populate('items.locationId', 'locationName') // Populate locationId in items with locationName from Location
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
