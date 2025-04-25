const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const purchaseOrderService = require('../services');

// Create a new purchase order
const createPurchaseOrder = catchAsync(async (req, res) => {
  const purchaseOrder = await purchaseOrderService.createPurchaseOrder(
    req.body,
  );
  res.status(httpStatus.CREATED).send({ purchaseOrder });
});

// Get all purchase orders
const getAllPurchaseOrders = catchAsync(async (req, res) => {
  const result = await purchaseOrderService.getAllPurchaseOrders();
  res.status(httpStatus.OK).send(result); // { purchaseOrders, count }
});

// Get purchase order by ID
const getPurchaseOrderById = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const purchaseOrder = await purchaseOrderService.getPurchaseOrderById(
    orderId,
  );
  if (!purchaseOrder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Purchase order not found');
  }
  res.status(httpStatus.OK).send({ purchaseOrder });
});

// Update purchase order
const updatePurchaseOrder = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const updatedOrder = await purchaseOrderService.updatePurchaseOrder(
    orderId,
    req.body,
  );
  res.status(httpStatus.OK).send({ purchaseOrder: updatedOrder });
});

// Delete purchase order
const deletePurchaseOrder = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const response = await purchaseOrderService.deletePurchaseOrder(orderId);
  res.status(httpStatus.OK).send(response); // { message: 'Purchase order deleted successfully' }
});

module.exports = {
  createPurchaseOrder,
  getAllPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrder,
  deletePurchaseOrder,
};
