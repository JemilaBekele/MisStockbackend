module.exports.blogController = require('./blog.controller');
module.exports.commentController = require('./comment.controller');

module.exports.authController = require('./auth.controller');
module.exports.tenantController = require('./tenant.controller');

module.exports.areaController = require('./area.controller');
module.exports.spaceController = require('./space.controller');
module.exports.unitController = require('./unit.controller');
module.exports.fearureController = require('./fearure.controller');

// inventory

module.exports.InventoryCategoryController = require('./inventoryCategory.controller');
module.exports.inventoryItemController = require('./InventoryItem.controller');
module.exports.inventoryLocationController = require('./inventoryLocation.controller');
module.exports.inventoryLogController = require('./inventoryLog.controller');
module.exports.inventoryStockController = require('./inventoryStock.controller');
module.exports.purchaseOrderController = require('./purchaseOrder.controller');
module.exports.inventoryRequestController = require('./inventoryrequuest.controller');

// finance
module.exports.FinancialAccountController = require('./financialAccount.controller');
module.exports.ExpenseCategoryController = require('./expenseCategory.controller');
module.exports.revenueCategoryController = require('./revenueCategory.controller');
module.exports.salaryPaymentController = require('./salaryPayment.controller');
module.exports.transactionController = require('./transaction.controller');
module.exports.InvoiceController = require('./invoice.controller');
