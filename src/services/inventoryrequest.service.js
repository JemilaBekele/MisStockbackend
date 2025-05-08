const httpStatus = require('http-status');
const {
  InventoryRequest,
  InventoryLog,
  InventoryItem,
  InventoryStock,
  Unit,
  User,
} = require('../models');
const ApiError = require('../utils/ApiError');

// Create Inventory Request
const createInventoryRequest = async (requestBody) => {
  const { itemId, requestedBy, locationId, itemLocations, approvals } =
    requestBody;

  // Validate item
  const item = await InventoryItem.findById(itemId);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Inventory item not found');
  }

  // Validate requesting user
  const user = await User.findById(requestedBy);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Requesting user not found');
  }

  // Validate location if using simple request format
  if (locationId && !itemLocations) {
    const location = await Unit.findById(locationId);
    if (!location) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Location not found');
    }
  }

  // Validate itemLocations if using complex request format
  if (itemLocations && itemLocations.length > 0) {
    await Promise.all(
      itemLocations.map(async (loc) => {
        const location = await Unit.findById(loc.locationId);
        if (!location) {
          throw new ApiError(
            httpStatus.NOT_FOUND,
            `Location not found: ${loc.locationId}`,
          );
        }
        if (!loc.quantity || loc.quantity < 1) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            `Invalid quantity for location ${loc.locationId}`,
          );
        }
      }),
    );

    // Ensure we don't have duplicate locations
    const locationIds = itemLocations.map((loc) => loc.locationId.toString());
    if (new Set(locationIds).size !== locationIds.length) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Duplicate locations in itemLocations',
      );
    }
  }

  // Validate approvers (if provided)
  if (approvals && approvals.length > 0) {
    await Promise.all(
      approvals.map(async (approval) => {
        const approver = await User.findById(approval.approverId);
        if (!approver) {
          throw new ApiError(
            httpStatus.NOT_FOUND,
            `Approver not found: ${approval.approverId}`,
          );
        }
      }),
    );
  }

  // Ensure either quantity/locationId OR itemLocations is provided, but not both
  if ((locationId || requestBody.quantity) && itemLocations) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Cannot specify both quantity/locationId and itemLocations',
    );
  }

  const inventoryRequest = await InventoryRequest.create(requestBody);

  // Create inventory log for the request
  const totalQuantity = itemLocations
    ? itemLocations.reduce((sum, loc) => sum + loc.quantity, 0)
    : requestBody.quantity || 0;

  await InventoryLog.create({
    itemId,
    action: 'Requested', // You might want to add 'Requested' to your enum
    userId: requestedBy,
    quantityChanged: totalQuantity,
    notes: `Inventory request created for ${totalQuantity} items`,
  });

  return inventoryRequest;
};

// Get Inventory Request by ID
const getInventoryRequestById = async (id) => {
  const request = await InventoryRequest.findById(id)
    .populate('itemId', 'itemName')
    .populate('requestedBy', 'name')
    .populate('locationId', 'unitNumber floor type')
    .populate('itemLocations.locationId', 'unitNumber floor type')
    .populate('approvals.approverId', 'name');

  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Inventory request not found');
  }
  return request;
};

// Get all Inventory Requests
const getAllInventoryRequests = async (filter = {}) => {
  const requests = await InventoryRequest.find(filter)
    .sort({ createdAt: -1 })
    .populate('itemId', 'itemName')
    .populate('requestedBy', 'name')
    .populate('locationId', 'unitNumber floor type')
    .populate('itemLocations.locationId', 'unitNumber floor type')
    .populate('approvals.approverId', 'name');

  return {
    requests,
    count: requests.length,
  };
};

// Update Inventory Request
const updateInventoryRequest = async (id, updateBody) => {
  const request = await getInventoryRequestById(id);

  // Store original values for comparison
  const originalRequest = {
    status: request.status,
    quantity: request.quantity,
    itemLocations: request.itemLocations ? [...request.itemLocations] : null,
    itemId: request.itemId,
    itemName: request.itemId
      ? (await InventoryItem.findById(request.itemId))?.itemName
      : null,
  };

  if (updateBody.itemId) {
    const item = await InventoryItem.findById(updateBody.itemId);
    if (!item) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Inventory item not found');
    }
    // eslint-disable-next-line no-param-reassign
    updateBody.itemName = item.itemName; // Store item name for logging
  }

  if (updateBody.requestedBy) {
    const user = await User.findById(updateBody.requestedBy);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Requesting user not found');
    }
    // eslint-disable-next-line no-param-reassign
    updateBody.requestedByName = `${user.firstName} ${user.lastName}`; // Store user name for logging
  }

  // ... [keep all the existing validation code] ...

  Object.assign(request, updateBody);
  await request.save();

  // Create inventory logs based on changes
  const logPromises = [];

  // Helper to get location names for logging
  const getLocationName = async (locationId) => {
    const location = await Unit.findById(locationId);
    return location ? location.name : locationId;
  };

  // Log if status changed
  if (updateBody.status && updateBody.status !== originalRequest.status) {
    logPromises.push(
      InventoryLog.create({
        itemId: request.itemId,
        action: 'Updated',
        userId: request.requestedBy,
        quantityChanged: 0,
        notes: `Request status changed from ${originalRequest.status} to ${request.status}`,
      }),
    );
  }

  // Log if quantity changed (simple format)
  if (updateBody.quantity && updateBody.quantity !== originalRequest.quantity) {
    logPromises.push(
      InventoryLog.create({
        itemId: request.itemId,
        action: 'Updated',
        userId: request.requestedBy,
        quantityChanged: updateBody.quantity - (originalRequest.quantity || 0),
        notes: `Request quantity changed from ${
          originalRequest.quantity || 0
        } to ${updateBody.quantity}`,
      }),
    );
  }

  // Log if itemLocations changed (complex format)
  if (updateBody.itemLocations) {
    const originalTotal = originalRequest.itemLocations
      ? originalRequest.itemLocations.reduce(
          (sum, loc) => sum + loc.quantity,
          0,
        )
      : 0;
    const newTotal = updateBody.itemLocations.reduce(
      (sum, loc) => sum + loc.quantity,
      0,
    );

    if (newTotal !== originalTotal) {
      logPromises.push(
        InventoryLog.create({
          itemId: request.itemId,
          action: 'Updated',
          userId: request.requestedBy,
          quantityChanged: newTotal - originalTotal,
          notes: `Request total quantity changed from ${originalTotal} to ${newTotal}`,
        }),
      );
    }

    // Additional log for location changes if needed
    if (originalRequest.itemLocations) {
      const locationChanges = await Promise.all(
        updateBody.itemLocations.map(async (newLoc) => {
          const oldLoc = originalRequest.itemLocations.find(
            (loc) => loc.locationId.toString() === newLoc.locationId.toString(),
          );
          if (!oldLoc || oldLoc.quantity !== newLoc.quantity) {
            const locationName = await getLocationName(newLoc.locationId);
            return {
              locationName,
              oldQuantity: oldLoc ? oldLoc.quantity : 0,
              newQuantity: newLoc.quantity,
            };
          }
          return null;
        }),
      ).then((results) => results.filter(Boolean));

      if (locationChanges.length > 0) {
        logPromises.push(
          InventoryLog.create({
            itemId: request.itemId,
            action: 'Transferred',
            userId: request.requestedBy,
            quantityChanged: 0,
            notes: `Location quantities updated: ${locationChanges
              .map(
                (change) =>
                  `${change.oldQuantity}→${change.newQuantity} at ${change.locationName}`,
              )
              .join(', ')}`,
          }),
        );
      }
    }
  }

  // Log if item changed
  if (updateBody.itemId && updateBody.itemId !== originalRequest.itemId) {
    const newItemName =
      (await InventoryItem.findById(updateBody.itemId))?.itemName ||
      updateBody.itemId;
    logPromises.push(
      InventoryLog.create({
        itemId: originalRequest.itemId,
        action: 'Updated',
        userId: request.requestedBy,
        quantityChanged: 0,
        notes: `Request item changed from "${
          originalRequest.itemName || originalRequest.itemId
        }" to "${updateBody.itemName || newItemName}"`,
      }),
    );
  }

  await Promise.all(logPromises);

  return request;
};

const approveInventoryRequest = async (requestId, approvalBody) => {
  const request = await InventoryRequest.findById(requestId)
    .populate('itemId')
    .populate('requestedBy')
    .populate('locationId')
    .populate('itemLocations.locationId');

  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Inventory request not found');
  }

  // Validate request isn't already processed
  if (request.status !== 'Pending') {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Request is already ${request.status} and cannot be modified`,
    );
  }

  // Initialize approvals array if it doesn't exist
  if (!request.approvals || !Array.isArray(request.approvals)) {
    request.approvals = [];
  }

  // Create initial approval log
  await InventoryLog.create({
    itemId: request.itemId.id,
    action: 'Approval',
    userId: approvalBody.approverId,
    quantityChanged: 0,
    notes: `Approval decision: ${approvalBody.decision} by approver`,
  });

  // Check if approver already exists in approvals
  let approval = request.approvals.find(
    (a) => a.approverId?.toString() === approvalBody.approverId.toString(),
  );

  if (!approval) {
    // Add new approval if approver not found
    approval = {
      approverId: approvalBody.approverId,
      decision: approvalBody.decision,
      decisionDate: new Date(),
      notes: approvalBody.notes,
    };
    request.approvals.push(approval);
  } else {
    // Update existing approval
    approval.decision = approvalBody.decision;
    approval.decisionDate = new Date();
    approval.notes = approvalBody.notes;
  }

  // Check approval statuses
  const allApproved = request.approvals.every((a) => a.decision === 'Approved');
  const anyRejected = request.approvals.some((a) => a.decision === 'Rejected');

  if (anyRejected) {
    request.status = 'Rejected';
    await request.save();

    // await InventoryLog.create({
    //   itemId: request.itemId.id,
    //   action: 'Status Change',
    //   userId: approvalBody.approverId,
    //   quantityChanged: 0,
    //   notes: `Request rejected by  Reason: ${
    //     approvalBody.notes || 'No reason provided'
    //   }`,
    // });

    return request;
  }

  if (allApproved) {
    request.status = 'Approved';
    await request.save();

    // Log status change
    // await InventoryLog.create({
    //   itemId: request.itemId.id,
    //   action: 'Status Change',
    //   userId: approvalBody.approverId,
    //   quantityChanged: 0,
    //   notes: 'Request fully approved by all approvers',
    // });

    // Handle stock withdrawal if applicable
    if (request.type === 'StockWithdrawal') {
      try {
        if (request.itemLocations?.length > 0) {
          // Process multiple locations
          await Promise.all(
            request.itemLocations.map(async (loc) => {
              const stock = await InventoryStock.findOne({
                itemId: request.itemId.id,
                locationId: loc.locationId.id,
                status: 'Available',
              });

              if (!stock || stock.quantity < loc.quantity) {
                throw new ApiError(
                  httpStatus.BAD_REQUEST,
                  `Insufficient stock at location ${loc.locationId.id}`,
                );
              }

              stock.quantity -= loc.quantity;
              await stock.save();

              await InventoryLog.create({
                itemId: request.itemId.id,
                action: 'Stock Adjustment',
                userId: request.requestedBy.id,
                quantityChanged: -loc.quantity,
                locationId: loc.locationId.id,
                notes: `Stock withdrawn per approved request ${approvalBody.approverId.name}`,
              });
            }),
          );
        } else {
          // Process single location
          const stock = await InventoryStock.findOne({
            itemId: request.itemId.id,
            locationId: request.locationId?.id,
            status: 'Available',
          });

          if (!stock || stock.quantity < request.quantity) {
            throw new ApiError(
              httpStatus.BAD_REQUEST,
              'Insufficient stock at the location',
            );
          }

          stock.quantity -= request.quantity;
          await stock.save();

          await InventoryLog.create({
            itemId: request.itemId.id,
            action: 'Stock Adjustment',
            userId: request.requestedBy.id,
            quantityChanged: -request.quantity,
            locationId: request.locationId?.id,
            notes: `Stock withdrawn per approved request  ${approvalBody.approverId.name}`,
          });
        }

        // Mark request as fulfilled after successful stock withdrawal
        request.status = 'Fulfilled';
        await request.save();

        await InventoryLog.create({
          itemId: request.itemId.id,
          action: 'Request Fulfilled',
          userId: approvalBody.approverId,
          quantityChanged: 0,
          notes: 'Request completed and stock withdrawn',
        });
      } catch (error) {
        // Revert status if stock withdrawal fails
        request.status = 'Approved'; // Keep as approved but not fulfilled
        await request.save();

        await InventoryLog.create({
          itemId: request.itemId.id,
          action: 'Error',
          userId: approvalBody.approverId,
          quantityChanged: 0,
          notes: `Approval completed but stock withdrawal failed: ${error.message}`,
        });

        throw error; // Re-throw for handling by caller
      }
    }
  } else {
    // Partial approval - not all approvers have approved yet
    await request.save();
    await InventoryLog.create({
      itemId: request.itemId.id,
      action: 'Partial Approval',
      userId: approvalBody.approverId,
      quantityChanged: 0,
      notes: 'Request partially approved, waiting for other approvers',
    });
  }

  return request;
};

// Delete Inventory Request
const deleteInventoryRequest = async (id) => {
  const request = await getInventoryRequestById(id);
  await request.remove();
  return { message: 'Inventory request deleted successfully' };
};

module.exports = {
  createInventoryRequest,
  getInventoryRequestById,
  getAllInventoryRequests,
  updateInventoryRequest,
  deleteInventoryRequest,
  approveInventoryRequest,
};
