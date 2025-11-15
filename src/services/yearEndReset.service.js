// services/yearEndResetService.js
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const prisma = require('./prisma');

// Year End Reset - Delete only transactional data
const yearEndReset = async () => {
  try {
    // Disable foreign key checks
    await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`;

    // Delete only transactional data in correct dependency order
    await prisma.sellStockCorrectionBatch.deleteMany();
    await prisma.sellStockCorrectionItem.deleteMany();
    await prisma.sellStockCorrection.deleteMany();
    await prisma.sellItemBatch.deleteMany();
    await prisma.sellItem.deleteMany();
    await prisma.sell.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.addToCart.deleteMany();
    await prisma.stockCorrectionItem.deleteMany();
    await prisma.stockCorrection.deleteMany();
    await prisma.transferItem.deleteMany();
    await prisma.transfer.deleteMany();
    await prisma.purchaseItem.deleteMany();
    await prisma.purchase.deleteMany();
    // await prisma.stockLedger.deleteMany();
    await prisma.log.deleteMany();
    await prisma.notification.deleteMany();

    // Re-enable foreign key checks
    await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`;

    return {
      success: true,
      message:
        'Year-end transaction reset completed successfully. All transactional data has been cleared while preserving products, stocks, and master data.',
    };
  } catch (error) {
    // Ensure foreign key checks are re-enabled even if error occurs
    await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`.catch(() => {});

    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Year-end reset failed: ${error.message}`,
    );
  }
};

module.exports = {
  yearEndReset,
};
