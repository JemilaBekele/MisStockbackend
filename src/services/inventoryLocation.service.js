const httpStatus = require('http-status');
const { InventoryLocation } = require('../models');
const ApiError = require('../utils/ApiError');

// Create Inventory Location
const createInventoryLocation = async (inventoryLocationBody) => {
  // Create the inventory location
  const inventoryLocation = await InventoryLocation.create(
    inventoryLocationBody,
  );
  return inventoryLocation;
};

// Get Inventory Location by ID
const getInventoryLocationById = async (id) => {
  const inventoryLocation = await InventoryLocation.findById(id);
  if (!inventoryLocation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Inventory location not found');
  }
  return inventoryLocation;
};

// Get all Inventory Locations
const getAllInventoryLocations = async () => {
  const inventoryLocations = await InventoryLocation.find().sort({ name: 1 });
  return {
    inventoryLocations,
    count: inventoryLocations.length,
  };
};

// Update Inventory Location
const updateInventoryLocation = async (id, updateBody) => {
  const inventoryLocation = await getInventoryLocationById(id);

  // Update the inventory location
  Object.assign(inventoryLocation, updateBody);
  await inventoryLocation.save();
  return inventoryLocation;
};

// Delete Inventory Location
const deleteInventoryLocation = async (id) => {
  const inventoryLocation = await getInventoryLocationById(id);
  await inventoryLocation.remove();
  return { message: 'Inventory location deleted successfully' };
};

module.exports = {
  createInventoryLocation,
  getInventoryLocationById,
  getAllInventoryLocations,
  updateInventoryLocation,
  deleteInventoryLocation,
};
