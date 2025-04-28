const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { unitService } = require('../services');
const ApiError = require('../utils/ApiError');

// Create a unit
const createUnit = catchAsync(async (req, res) => {
  const unit = await unitService.createUnit(req.body);
  res
    .status(httpStatus.CREATED)
    .send({ success: true, message: 'Unit created successfully', unit });
});

// Get a unit by ID
const getUnitById = catchAsync(async (req, res) => {
  const unit = await unitService.getUnitById(req.params.id);
  if (!unit) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unit not found');
  }
  res.status(httpStatus.OK).send(unit);
});

// Get all units
const getAllUnits = catchAsync(async (req, res) => {
  const units = await unitService.getAllUnits();
  res.status(httpStatus.OK).json(units);
});


const getAllstore = catchAsync(async (req, res) => {
  const units = await unitService.getAllstore();
  res.status(httpStatus.OK).json(units);
});
// Get units by area
const getUnitsByArea = catchAsync(async (req, res) => {
  const units = await unitService.getUnitsByArea(req.params.areaId);
  res.status(httpStatus.OK).json(units);
});

// Update a unit
const updateUnit = catchAsync(async (req, res) => {
  const unit = await unitService.updateUnit(req.params.id, req.body);
  res
    .status(httpStatus.OK)
    .send({ success: true, message: 'Unit updated successfully', unit });
});

// Delete a unit
const deleteUnit = catchAsync(async (req, res) => {
  const response = await unitService.deleteUnit(req.params.id);
 res.status(httpStatus.OK).send(response);
});

module.exports = {
  createUnit,
  getUnitById,
  getAllUnits,
  getAllstore,
  getUnitsByArea,
  updateUnit,
  deleteUnit,
};
