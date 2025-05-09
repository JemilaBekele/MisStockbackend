const express = require('express');
const httpStatus = require('http-status');
const passport = require('passport');
const { xss } = require('express-xss-sanitizer');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const cors = require('cors');
const blogRouter = require('../routes/blog.route');
const authRouter = require('../routes/auth.route');
const tenantRouter = require('../routes/tenant.route');

const areaRouter = require('../routes/area.route');
const unitRouter = require('../routes/unit.route');
const spaceRouter = require('../routes/space.route');
const fearureRouter = require('../routes/fearure.route');

const InventoryCategoryRouter = require('../routes/inventoryCategory.route');
const InventoryItemRouter = require('../routes/inventoryItem.route');
const InventoryLocationRouter = require('../routes/inventoryLocation.route');
const InventoryLogRouter = require('../routes/inventoryLog.route');
const InventoryStockRouter = require('../routes/inventoryStock.route');
const PurchaseOrderRouter = require('../routes/purchaseOrder.route');
const InventoryRequestRouter = require('../routes/inventoryrequest.route');

const expenseCategoryRouter = require('../routes/expenseCategory.routes');
const revenueCategoryRouter = require('../routes/revenueCategory.route');
const salaryPaymentRouter = require('../routes/salaryPayment.route');
const transactionRouter = require('../routes/transactionControlle.route');
const invoiceRouter = require('../routes/invoice.routes');
const financeRouter = require('../routes/financialAccount.routes');

const commentRouter = require('../routes/comment.route');
const { errorHandler, errorConverter } = require('../middlewares/error');
const ApiError = require('../utils/ApiError');
const morgan = require('../config/morgan');
const { jwtStrategy } = require('../config/passport');
const { cspOptions, env } = require('../config/config');

module.exports = async (app) => {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
  // jwt authentication
  app.use(passport.initialize());
  passport.use('jwt', jwtStrategy);
  app.use(express.json());
  // security
  app.use(xss());
  app.use(
    helmet({
      contentSecurityPolicy: cspOptions,
    }),
  );
  app.use(mongoSanitize());
  if (env === 'production') {
    app.use(cors({ origin: 'url' }));
    app.options('*', cors({ origin: 'url' }));
  } else {
    // enabling all cors
    app.use(cors());
    app.options('*', cors());
  }
  app.use(blogRouter);
  app.use(commentRouter);
  app.use(authRouter);
  app.use(tenantRouter);
  app.use(areaRouter);
  app.use(unitRouter);
  app.use(spaceRouter);
  app.use(fearureRouter);
  // inventory
  app.use(InventoryCategoryRouter);
  app.use(InventoryItemRouter);
  app.use(InventoryLocationRouter);
  app.use(InventoryLogRouter);
  app.use(InventoryStockRouter);
  app.use(PurchaseOrderRouter);
  app.use(InventoryRequestRouter);

  // finance
  app.use(expenseCategoryRouter);
  app.use(revenueCategoryRouter);
  app.use(salaryPaymentRouter);
  app.use(transactionRouter);
  app.use(invoiceRouter);
  app.use(financeRouter);
  // path not found 404
  app.use((req, res, next) => {
    next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
  });
  app.use(errorConverter);
  app.use(errorHandler);
  return app;
};
