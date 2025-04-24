const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { spaceService } = require('../services');
const ApiError = require('../utils/ApiError');

// Create a space
const createSpace = catchAsync(async (req, res) => {
  const space = await spaceService.createSpace(req.body);
  res
    .status(httpStatus.CREATED)
    .send({ success: true, message: 'Space created successfully', space });
});

// Get a space by ID
const getSpaceById = catchAsync(async (req, res) => {
  const space = await spaceService.getSpaceById(req.params.id);
  if (!space) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Space not found');
  }
  res.status(httpStatus.OK).send(space);
});

// Get all spaces
const getAllSpaces = catchAsync(async (req, res) => {
  const spaces = await spaceService.getAllSpaces();
  res.status(httpStatus.OK).json(spaces);
});

// Get spaces by area
const getSpacesByArea = catchAsync(async (req, res) => {
  const spaces = await spaceService.getSpacesByArea(req.params.areaId);
  res.status(httpStatus.OK).json(spaces);
});

// Update a space
const updateSpace = catchAsync(async (req, res) => {
  const space = await spaceService.updateSpace(req.params.id, req.body);
  res
    .status(httpStatus.OK)
    .send({ success: true, message: 'Space updated successfully', space });
});

// Delete a space
const deleteSpace = catchAsync(async (req, res) => {
  const response = await spaceService.deleteSpace(req.params.id);
  res.status(httpStatus.OK).send(response);
});

module.exports = {
  createSpace,
  getSpaceById,
  getAllSpaces,
  getSpacesByArea,
  updateSpace,
  deleteSpace,
};
