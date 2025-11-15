// src/cron/invoice.cron.js
const cron = require('node-cron');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { leaseService } = require('../services');

// ⏰ Runs every day at midnight
const startInvoiceCron = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      const result = await leaseService.generateLeaseInvoices();

      if (!result || result.count === 0) {
        throw new ApiError(
          httpStatus.NO_CONTENT,
          'No invoices generated during scheduled task.',
        );
      }

      throw new ApiError(
        httpStatus.OK,
        `✅ Scheduled invoice generation completed: ${result.count} invoices created.`,
      );
    } catch (error) {
      if (error instanceof ApiError) {
        /* empty */
      } else {
      }
    }
  });
};

module.exports = startInvoiceCron;
