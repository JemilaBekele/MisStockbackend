/* eslint-disable no-underscore-dangle */
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const prisma = require('./prisma');

// Get all totals with items
const getAllTotalsWithItems = async () => {
  try {
    // Purchase Counts by Status
    const purchaseCounts = await prisma.purchase.groupBy({
      by: ['paymentStatus'],
      _count: {
        id: true,
      },
    });

    const totalApprovedPurchases =
      purchaseCounts.find((p) => p.paymentStatus === 'APPROVED')?._count.id ||
      0;
    const totalCancelledPurchases =
      purchaseCounts.find((p) => p.paymentStatus === 'REJECTED')?._count.id ||
      0;
    const totalPendingPurchases =
      purchaseCounts.find((p) => p.paymentStatus === 'PENDING')?._count.id || 0;
    const totalPurchaseCount = purchaseCounts.reduce(
      (sum, p) => sum + p._count.id,
      0,
    );

    // Transfer Counts by Status
    const transferCounts = await prisma.transfer.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    const totalCompletedTransfers =
      transferCounts.find((t) => t.status === 'COMPLETED')?._count.id || 0;
    const totalCancelledTransfers =
      transferCounts.find((t) => t.status === 'CANCELLED')?._count.id || 0;
    const totalPendingTransfers =
      transferCounts.find((t) => t.status === 'PENDING')?._count.id || 0;
    const totalTransferCount = transferCounts.reduce(
      (sum, t) => sum + t._count.id,
      0,
    );

    // Sell Counts by Status
    const sellCounts = await prisma.sell.groupBy({
      by: ['saleStatus'],
      _count: {
        id: true,
      },
    });

    const totalNotApprovedSells =
      sellCounts.find((s) => s.saleStatus === 'NOT_APPROVED')?._count.id || 0;
    const totalPartiallyDeliveredSells =
      sellCounts.find((s) => s.saleStatus === 'PARTIALLY_DELIVERED')?._count
        .id || 0;
    const totalApprovedSells =
      sellCounts.find((s) => s.saleStatus === 'APPROVED')?._count.id || 0;
    const totalDeliveredSells =
      sellCounts.find((s) => s.saleStatus === 'DELIVERED')?._count.id || 0;
    const totalCancelledSells =
      sellCounts.find((s) => s.saleStatus === 'CANCELLED')?._count.id || 0;
    const totalSellCount = sellCounts.reduce((sum, s) => sum + s._count.id, 0);

    // Stock Correction Counts by Status
    const stockCorrectionCounts = await prisma.stockCorrection.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    const totalApprovedStockCorrections =
      stockCorrectionCounts.find((sc) => sc.status === 'APPROVED')?._count.id ||
      0;
    const totalRejectedStockCorrections =
      stockCorrectionCounts.find((sc) => sc.status === 'REJECTED')?._count.id ||
      0;
    const totalPendingStockCorrections =
      stockCorrectionCounts.find((sc) => sc.status === 'PENDING')?._count.id ||
      0;
    const totalStockCorrectionCount = stockCorrectionCounts.reduce(
      (sum, sc) => sum + sc._count.id,
      0,
    );

    // Sell Stock Correction Counts by Status
    const sellStockCorrectionCounts = await prisma.sellStockCorrection.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    const totalApprovedSellCorrections =
      sellStockCorrectionCounts.find((ssc) => ssc.status === 'APPROVED')?._count
        .id || 0;
    const totalRejectedSellCorrections =
      sellStockCorrectionCounts.find((ssc) => ssc.status === 'REJECTED')?._count
        .id || 0;
    const totalPendingSellCorrections =
      sellStockCorrectionCounts.find((ssc) => ssc.status === 'PENDING')?._count
        .id || 0;
    const totalSellStockCorrectionCount = sellStockCorrectionCounts.reduce(
      (sum, ssc) => sum + ssc._count.id,
      0,
    );

    // Financial totals (if still needed for some calculations)
    const approvedPurchasesFinancial = await prisma.purchase.aggregate({
      where: { paymentStatus: 'APPROVED' },
      _sum: { grandTotal: true },
    });

    const approvedSellsFinancial = await prisma.sell.aggregate({
      where: { saleStatus: 'APPROVED' },
      _sum: { NetTotal: true },
    });

    const grandTotalCount =
      totalPurchaseCount +
      totalTransferCount +
      totalSellCount +
      totalStockCorrectionCount +
      totalSellStockCorrectionCount;

    return {
      // Purchase counts
      purchase: {
        approved: totalApprovedPurchases,
        cancelled: totalCancelledPurchases,
        pending: totalPendingPurchases,
        total: totalPurchaseCount,
        financialTotal: approvedPurchasesFinancial._sum.grandTotal || 0,
      },

      // Transfer counts
      transfer: {
        completed: totalCompletedTransfers,
        cancelled: totalCancelledTransfers,
        pending: totalPendingTransfers,
        total: totalTransferCount,
      },

      // Sell counts
      sell: {
        notApproved: totalNotApprovedSells,
        partiallyDelivered: totalPartiallyDeliveredSells,
        approved: totalApprovedSells,
        delivered: totalDeliveredSells,
        cancelled: totalCancelledSells,
        total: totalSellCount,
        financialTotal: approvedSellsFinancial._sum.NetTotal || 0,
      },

      // Stock Correction counts
      stockCorrection: {
        approved: totalApprovedStockCorrections,
        rejected: totalRejectedStockCorrections,
        pending: totalPendingStockCorrections,
        total: totalStockCorrectionCount,
      },

      // Sell Stock Correction counts
      sellStockCorrection: {
        approved: totalApprovedSellCorrections,
        rejected: totalRejectedSellCorrections,
        pending: totalPendingSellCorrections,
        total: totalSellStockCorrectionCount,
      },

      // Overall totals
      grandTotalCount,
      totalFinancial:
        (approvedPurchasesFinancial._sum.grandTotal || 0) +
        (approvedSellsFinancial._sum.NetTotal || 0),
    };
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error fetching dashboard totals data',
    );
  }
};
// Get sell status pie chart data
const getSellStatusPieChart = async () => {
  try {
    // Aggregate total NetTotal for each sale status
    const sellStatusAggregation = await prisma.sell.groupBy({
      by: ['saleStatus'],
      _sum: {
        NetTotal: true,
      },
      _count: {
        id: true,
      },
    });

    // Calculate total for percentage calculations
    const totalNetTotal = sellStatusAggregation.reduce(
      (sum, item) => sum + (item._sum.NetTotal || 0),
      0,
    );

    const totalCount = sellStatusAggregation.reduce(
      (sum, item) => sum + (item._count.id || 0),
      0,
    );

    // Define status labels and colors for the chart
    const statusConfig = {
      NOT_APPROVED: { label: 'Not Approved', color: 'var(--chart-1)' },
      PARTIALLY_DELIVERED: {
        label: 'Partially Delivered',
        color: 'var(--chart-2)',
      },
      APPROVED: { label: 'Approved', color: 'var(--chart-3)' },
      DELIVERED: { label: 'Delivered', color: 'var(--chart-4)' },
      CANCELLED: { label: 'Cancelled', color: 'var(--chart-5)' },
    };

    // Transform data for pie chart in Recharts format
    const chartData = Object.keys(statusConfig).map((status) => {
      const aggregationItem = sellStatusAggregation.find(
        (item) => item.saleStatus === status,
      );
      const amount = aggregationItem?._sum.NetTotal || 0;

      return {
        status,
        label: statusConfig[status].label,
        amount,
        count: aggregationItem?._count.id || 0,
        fill: statusConfig[status].color,
        percentage: totalNetTotal > 0 ? (amount / totalNetTotal) * 100 : 0,
      };
    });

    // Create chart config for Recharts
    const chartConfig = {
      amount: {
        label: 'Sales Amount',
      },
      ...Object.fromEntries(
        Object.entries(statusConfig).map(([status, config]) => [
          status.toLowerCase(),
          {
            label: config.label,
            color: config.color,
          },
        ]),
      ),
    };

    return {
      summary: {
        totalNetTotal,
        totalCount,
        data: chartData,
      },
      chartData: chartData.map((item) => ({
        status: item.status.toLowerCase(),
        amount: item.amount,
        fill: item.fill,
        label: item.label,
        count: item.count,
        percentage: item.percentage,
      })),
      chartConfig,
      totalAmount: totalNetTotal,
      totalTransactions: totalCount,
    };
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Error fetching pie chart data',
    );
  }
};

module.exports = {
  getAllTotalsWithItems,
  getSellStatusPieChart,
};
