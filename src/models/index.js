module.exports.Blog = require('./blog.model');

module.exports.User = require('./user.model');
module.exports.Token = require('./token.model');
module.exports.TokenToken = require('./tenantstoken.model');
module.exports.Tenant = require('./tenants.model');

module.exports.Area = require('./area.model');
module.exports.Unit = require('./unit.model');
module.exports.Space = require('./spacee.model');
module.exports.Feature = require('./fearure.model');

// inventory
module.exports.InventoryCategory = require('./Inventory/inventoryCategory.model');
module.exports.InventoryItem = require('./Inventory/InventoryItem.model');
module.exports.InventoryLocation = require('./Inventory/inventoryLocation.model');
module.exports.InventoryLog = require('./Inventory/inventoryLog.model');
module.exports.InventoryStock = require('./Inventory/inventoryStock.model');
module.exports.PurchaseOrder = require('./Inventory/purchaseOrder.model');
module.exports.InventoryRequest = require('./Inventory/inventoryrequest.model');

// finace
module.exports.Invoice = require('./finacial/Invoice.model');
module.exports.FinancialAccount = require('./finacial/FinancialAccount.model');
module.exports.RevenueCategory = require('./finacial/RevenueCategory.model');
module.exports.SalaryPayment = require('./finacial/SalaryPayment.model');
module.exports.Transaction = require('./finacial/Transaction.model');
module.exports.ExpenseCategory = require('./finacial/ExpenseCategory.model');
