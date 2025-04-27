const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { inventoryStockService } = require('../services');

// Create a new inventory stock
const createInventoryStock = catchAsync(async (req, res) => {
  const inventoryStock = await inventoryStockService.createInventoryStock(
    req.body,
  );
  res.status(httpStatus.CREATED).send({ inventoryStock });
});

// Get all inventory stocks
const getAllInventoryStocks = catchAsync(async (req, res) => {
  const result = await inventoryStockService.getAllInventoryStocks();
  res.status(httpStatus.OK).send(result); // { inventoryStocks, count }
});

// Get inventory stock by ID
const getInventoryStockById = catchAsync(async (req, res) => {
  const { stockId } = req.params;
  const inventoryStock = await inventoryStockService.getInventoryStockById(
    stockId,
  );
  if (!inventoryStock) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Inventory stock not found');
  }
  res.status(httpStatus.OK).send({ inventoryStock });
});

// Update inventory stock
const updateInventoryStock = catchAsync(async (req, res) => {
  const { stockId } = req.params;
  const updatedStock = await inventoryStockService.updateInventoryStock(
    stockId,
    req.body,
  );
  res.status(httpStatus.OK).send({ inventoryStock: updatedStock });
});

// Delete inventory stock
const deleteInventoryStock = catchAsync(async (req, res) => {
  const { stockId } = req.params;
  const response = await inventoryStockService.deleteInventoryStock(stockId);
  res.status(httpStatus.OK).send(response); // { message: 'Inventory stock deleted successfully' }
});

module.exports = {
  createInventoryStock,
  getAllInventoryStocks,
  getInventoryStockById,
  updateInventoryStock,
  deleteInventoryStock,
};
