const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { areaService } = require('../services');
const ApiError = require('../utils/ApiError');

// Create Area
const createArea = catchAsync(async (req, res) => {
  const area = await areaService.createArea(req.body);
  res
    .status(httpStatus.CREATED)
    .send({ success: true, message: 'Area created successfully', area });
});

// Get Area by ID
const getAreaById = catchAsync(async (req, res) => {
  const area = await areaService.getAreaById(req.params.id);
  if (!area) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Area not found');
  }
  res.status(httpStatus.OK).send(area);
});

// Get all Areas
const getAllAreas = catchAsync(async (req, res) => {
  const areas = await areaService.getAllAreas();
  res.status(httpStatus.OK).json(areas);
});

// Update Area
const updateArea = catchAsync(async (req, res) => {
  const area = await areaService.updateArea(req.params.id, req.body);
  res.status(httpStatus.OK).send({ success: true, message: 'Area updated successfully', area });
});

// Delete Area
const deleteArea = catchAsync(async (req, res) => {
  const response =  await areaService.deleteArea(req.params.id);
 res.status(httpStatus.OK).send(response);
});

module.exports = {
  createArea,
  getAreaById,
  getAllAreas,
  updateArea,
  deleteArea,
};
