const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const inventoryLocationService = require('../services');

// Create a new inventory location
const createInventoryLocation = catchAsync(async (req, res) => {
  const inventoryLocation =
    await inventoryLocationService.createInventoryLocation(req.body);
  res.status(httpStatus.CREATED).send({ inventoryLocation });
});

// Get all inventory locations
const getAllInventoryLocations = catchAsync(async (req, res) => {
  const result = await inventoryLocationService.getAllInventoryLocations();
  res.status(httpStatus.OK).send(result); // { inventoryLocations, count }
});

// Get inventory location by ID
const getInventoryLocationById = catchAsync(async (req, res) => {
  const { locationId } = req.params;
  const inventoryLocation =
    await inventoryLocationService.getInventoryLocationById(locationId);
  if (!inventoryLocation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Inventory location not found');
  }
  res.status(httpStatus.OK).send({ inventoryLocation });
});

// Update inventory location
const updateInventoryLocation = catchAsync(async (req, res) => {
  const { locationId } = req.params;
  const updatedLocation =
    await inventoryLocationService.updateInventoryLocation(
      locationId,
      req.body,
    );
  res.status(httpStatus.OK).send({ inventoryLocation: updatedLocation });
});

// Delete inventory location
const deleteInventoryLocation = catchAsync(async (req, res) => {
  const { locationId } = req.params;
  const response = await inventoryLocationService.deleteInventoryLocation(
    locationId,
  );
  res.status(httpStatus.OK).send(response); // { message: 'Inventory location deleted successfully' }
});

module.exports = {
  createInventoryLocation,
  getAllInventoryLocations,
  getInventoryLocationById,
  updateInventoryLocation,
  deleteInventoryLocation,
};
