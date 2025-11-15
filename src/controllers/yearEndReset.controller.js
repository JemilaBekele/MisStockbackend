// controllers/resetController.js
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { factoryResetService, yearEndResetService } = require('../services');

// Factory Reset - Delete all data
const factoryReset = catchAsync(async (req, res) => {
  const result = await factoryResetService.factoryReset();
  res.status(httpStatus.OK).send({
    success: true,
    message: result.message,
  });
});

// Year End Reset - Delete only transactional data
const yearEndReset = catchAsync(async (req, res) => {
  const result = await yearEndResetService.yearEndReset();
  res.status(httpStatus.OK).send({
    success: true,
    message: result.message,
  });
});

module.exports = {
  factoryReset,
  yearEndReset,
};
