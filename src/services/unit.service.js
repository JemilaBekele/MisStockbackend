const httpStatus = require('http-status');
const { Unit } = require('../models');
const ApiError = require('../utils/ApiError');

// Create a unit
const createUnit = async (unitBody) => {
  const unit = await Unit.create(unitBody);
  return unit;
};

// Get unit by ID
const getUnitById = async (id) => {
  const unit = await Unit.findById(id)
    .populate('areaId')
    .populate('roomIds');
  return unit;
};

// Get all units
const getAllUnits = async () => {
  const units = await Unit.find()
    .sort({ createdAt: -1 })
    .populate('areaId')
    .populate('roomIds');
  return units;
};

// Get units by area
const getUnitsByArea = async (areaId) => {
  const units = await Unit.find({ areaId })
    .sort({ unitNumber: 1 })
    .populate('roomIds');
  return units;
};

// Update a unit
const updateUnit = async (id, updateBody) => {
  const unit = await getUnitById(id);
  if (!unit) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unit not found');
  }

  Object.assign(unit, updateBody);
  await unit.save();
  return unit;
};

// Delete a unit
const deleteUnit = async (id) => {
  const unit = await getUnitById(id);
  if (!unit) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unit not found');
  }

  await unit.remove();
  return { message: 'Unit deleted successfully' };
};

module.exports = {
  createUnit,
  getUnitById,
  getAllUnits,
  getUnitsByArea,
  updateUnit,
  deleteUnit,
};
