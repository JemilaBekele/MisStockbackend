const httpStatus = require('http-status');
const { Space } = require('../models');
const ApiError = require('../utils/ApiError');

// Create a new space
const createSpace = async (spaceBody) => {
  const space = await Space.create(spaceBody);
  return space;
};

// Get a space by ID
const getSpaceById = async (id) => {
  const space = await Space.findById(id).populate('areaId').populate('linkedToUnitId');
  return space;
};

// Get all spaces
const getAllSpaces = async () => {
  const spaces = await Space.find().sort({ createdAt: -1 }).populate('areaId').populate('linkedToUnitId');
  return spaces;
};

// Get spaces by area
const getSpacesByArea = async (areaId) => {
  const spaces = await Space.find({ areaId }).sort({ spaceNumber: 1 });
  return spaces;
};

// Update a space
const updateSpace = async (id, updateBody) => {
  const space = await getSpaceById(id);
  if (!space) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Space not found');
  }

  Object.assign(space, updateBody);
  await space.save();
  return space;
};

// Delete a space
const deleteSpace = async (id) => {
  const space = await getSpaceById(id);
  if (!space) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Space not found');
  }

  await space.remove();
  return { message: 'Space deleted successfully' };
};

module.exports = {
  createSpace,
  getSpaceById,
  getAllSpaces,
  getSpacesByArea,
  updateSpace,
  deleteSpace,
};
