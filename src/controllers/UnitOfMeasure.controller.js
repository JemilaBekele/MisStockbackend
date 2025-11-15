const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { unitOfMeasureService } = require('../services');
const ApiError = require('../utils/ApiError');

// Create UnitOfMeasure
const createUnitOfMeasure = catchAsync(async (req, res) => {
  const unit = await unitOfMeasureService.createUnitOfMeasure(req.body);
  res.status(httpStatus.CREATED).send({
    success: true,
    message: 'Unit of measure created successfully',
    unit,
  });
});

// Get UnitOfMeasure by ID
const getUnitOfMeasure = catchAsync(async (req, res) => {
  const unit = await unitOfMeasureService.getUnitOfMeasureById(req.params.id);
  if (!unit) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unit of measure not found');
  }
  res.status(httpStatus.OK).send({
    success: true,
    unit,
  });
});

// Get all UnitsOfMeasure
const getUnitsOfMeasure = catchAsync(async (req, res) => {
  const result = await unitOfMeasureService.getAllUnitsOfMeasure();
  res.status(httpStatus.OK).send({
    success: true,
    ...result,
  });
});

// Update UnitOfMeasure
const updateUnitOfMeasure = catchAsync(async (req, res) => {
  const unit = await unitOfMeasureService.updateUnitOfMeasure(
    req.params.id,
    req.body,
  );
  res.status(httpStatus.OK).send({
    success: true,
    message: 'Unit of measure updated successfully',
    unit,
  });
});

// Delete UnitOfMeasure
const deleteUnitOfMeasure = catchAsync(async (req, res) => {
  await unitOfMeasureService.deleteUnitOfMeasure(req.params.id);
  res.status(httpStatus.OK).send({
    success: true,
    message: 'Unit of measure deleted successfully',
  });
});

module.exports = {
  createUnitOfMeasure,
  getUnitOfMeasure,
  getUnitsOfMeasure,
  updateUnitOfMeasure,
  deleteUnitOfMeasure,
};
