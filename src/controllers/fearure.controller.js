const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { fearureService } = require('../services');
const ApiError = require('../utils/ApiError');

// Create Fearure
const createFearure = catchAsync(async (req, res) => {
  const fearure = await fearureService.createFeature(req.body);
  res
    .status(httpStatus.CREATED)
    .send({ success: true, message: 'Fearure created successfully', fearure });
});

// Get Fearure by ID
const getFearureById = catchAsync(async (req, res) => {
  const fearure = await fearureService.getFeatureById(req.params.id);
  if (!fearure) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Fearure not found');
  }
  res.status(httpStatus.OK).send(fearure);
});

// Get all Fearures
const getAllFearures = catchAsync(async (req, res) => {
  const fearures = await fearureService.getAllFeatures();
  res.status(httpStatus.OK).json(fearures);
});

// Update Fearure
const updateFearure = catchAsync(async (req, res) => {
  const fearure = await fearureService.updateFeature(req.params.id, req.body);
  res.status(httpStatus.OK).send({ success: true, message: 'Fearure updated successfully', fearure });
});

// Delete Fearure
const deleteFearure = catchAsync(async (req, res) => {
  const response =  await fearureService.deleteFeature(req.params.id);
 res.status(httpStatus.OK).send(response);
});

module.exports = {
  createFearure,
  getFearureById,
  getAllFearures,
  updateFearure,
  deleteFearure,
};
