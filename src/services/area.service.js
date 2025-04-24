const httpStatus = require('http-status');
const { Area } = require('../models');
const ApiError = require('../utils/ApiError');

// Create Area
const createArea = async (areaBody) => {
  const area = await Area.create(areaBody);
  return area;
};

// Get Area by ID
const getAreaById = async (id) => {
  const area = await Area.findById(id);
  return area;
};

// Get all Areas
const getAllAreas = async () => {
  const areas = await Area.find().sort({ floorLevel: 1 });
  return {
    areas,
    count: areas.length,
  };
};

// Update Area
const updateArea = async (id, updateBody) => {
  const area = await getAreaById(id);
  if (!area) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Area not found');
  }

  Object.assign(area, updateBody);
  await area.save();
  return area;
};

// Delete Area
const deleteArea = async (id) => {
  const area = await getAreaById(id);
  if (!area) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Area not found');
  }

  await area.remove();
  return { message: 'Unit deleted successfully' };
};

module.exports = {
  createArea,
  getAreaById,
  getAllAreas,
  updateArea,
  deleteArea,
};
