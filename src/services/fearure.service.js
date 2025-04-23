const httpStatus = require('http-status');
const { Feature } = require('../models');
const ApiError = require('../utils/ApiError');

// Create Feature
const createFeature = async (featureBody) => {
  const feature = await Feature.create(featureBody);
  return feature;
};

// Get Feature by ID
const getFeatureById = async (id) => {
  const feature = await Feature.findById(id);
  return feature;
};

// Get all Features
const getAllFeatures = async () => {
  const features = await Feature.find().sort({ floorLevel: 1 });
  return features;
};

// Update Feature
const updateFeature = async (id, updateBody) => {
  const feature = await getFeatureById(id);
  if (!feature) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Feature not found');
  }

  Object.assign(feature, updateBody);
  await feature.save();
  return feature;
};

// Delete Feature
const deleteFeature = async (id) => {
  const feature = await getFeatureById(id);
  if (!feature) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Feature not found');
  }

  await feature.remove();
  return { message: 'Unit deleted successfully' };
};

module.exports = {
  createFeature,
  getFeatureById,
  getAllFeatures,
  updateFeature,
  deleteFeature,
};
