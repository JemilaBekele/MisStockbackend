const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { InventoryDashboardService } = require('../services');

/**
 * Get comprehensive inventory dashboard data
 */
const getInventoryDashboard = catchAsync(async (req, res) => {
  const dashboardData = await InventoryDashboardService.getInventoryDashboard();

  const safeDashboard = JSON.parse(
    JSON.stringify(dashboardData, (_, value) =>
      typeof value === 'bigint' ? Number(value) : value,
    ),
  );
  res.status(httpStatus.OK).send(safeDashboard);
});

/**
 * Get batch expiration details
 */
const getBatchExpirationDetails = catchAsync(async (req, res) => {
  const { withinDays } = req.query;
  const options = {
    withinDays: withinDays ? parseInt(withinDays, 10) : 30,
  };

  const expirationDetails =
    await InventoryDashboardService.getBatchExpirationDetails(options);

  const safeExpirationDetails = JSON.parse(
    JSON.stringify(expirationDetails, (_, value) =>
      typeof value === 'bigint' ? Number(value) : value,
    ),
  );
  res.status(httpStatus.OK).send(safeExpirationDetails);
});

/**
 * Get stock summary by location
 */
const getStockSummaryByLocation = catchAsync(async (req, res) => {
  const locationSummary =
    await InventoryDashboardService.getStockSummaryByLocation();

  const safeLocationSummary = JSON.parse(
    JSON.stringify(locationSummary, (_, value) =>
      typeof value === 'bigint' ? Number(value) : value,
    ),
  );
  res.status(httpStatus.OK).send(safeLocationSummary);
});

module.exports = {
  getInventoryDashboard,
  getBatchExpirationDetails,
  getStockSummaryByLocation,
};
