/* eslint-disable no-restricted-syntax */
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { ReportService } = require('../services');

// 📊 Get sales trend (grouped by month)
const getSellTrend = catchAsync(async (req, res) => {
  const chartData = await ReportService.getSellTrend();
  res.status(httpStatus.OK).send({
    success: true,
    chartData,
  });
});

// 💰 Get total sold in a date range
const getTotalSold = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  const result = await ReportService.getTotalSold({ startDate, endDate });

  res.status(httpStatus.OK).send({
    success: true,
    ...result,
  });
});

// 📋 Get all sells with filters
const getAllSells = catchAsync(async (req, res) => {
  const {
    startDate,
    endDate,
    createdById,
    customerId,
    branchId,
    saleStatus, // Add saleStatus filter
    itemSaleStatus,
  } = req.query;

  const result = await ReportService.getAllSells({
    startDate,
    endDate,
    createdById,
    customerId,
    branchId,
    saleStatus, // Add saleStatus filter
    itemSaleStatus,
  });

  res.status(httpStatus.OK).send({
    success: true,
    ...result,
  });
});

const generateSalesReportsController = catchAsync(async (req, res) => {
  const { startDate, endDate, shopId, limit, slowMoveThreshold } = req.query;

  const result = await ReportService.generateSalesReports({
    startDate,
    endDate,
    shopId,
    limit: limit ? parseInt(limit, 10) : undefined,
    slowMoveThreshold: slowMoveThreshold
      ? parseInt(slowMoveThreshold, 10)
      : undefined,
  });

  res.status(httpStatus.OK).send({
    success: true,
    ...result,
  });
});

const getUserDashboardSummary = catchAsync(async (req, res) => {
  const userId = req.user.id; // ✅ Get logged-in userId from auth middleware getSalesCreatorDashboardSummary

  const result = await ReportService.getUserDashboardSummary(userId);

  res.status(httpStatus.OK).send({
    success: true,
    ...result,
  });
});
const getSalesCreatorDashboardSummary = catchAsync(async (req, res) => {
  const userId = req.user.id; // ✅ Get logged-in userId from auth middleware

  const result = await ReportService.getSalesCreatorDashboardSummary(userId);

  res.status(httpStatus.OK).send({
    success: true,
    ...result,
  });
});
module.exports = {
  getSellTrend,
  getTotalSold,
  getAllSells,
  generateSalesReportsController,
  getUserDashboardSummary,
  getSalesCreatorDashboardSummary,
};
