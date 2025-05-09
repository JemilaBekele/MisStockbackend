const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const invoiceService = require('../services');

// Create a new invoice
const createInvoice = catchAsync(async (req, res) => {
  const invoice = await invoiceService.createInvoice(req.body);
  res.status(httpStatus.CREATED).send({ invoice });
});

// Get all invoices
const getAllInvoices = catchAsync(async (req, res) => {
  const result = await invoiceService.getAllInvoices();
  res.status(httpStatus.OK).send(result); // { invoices, count }
});

// Get invoice by ID
const getInvoiceById = catchAsync(async (req, res) => {
  const { invoiceId } = req.params;
  const invoice = await invoiceService.getInvoiceById(invoiceId);
  if (!invoice) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invoice not found');
  }
  res.status(httpStatus.OK).send({ invoice });
});

// Update invoice
const updateInvoice = catchAsync(async (req, res) => {
  const { invoiceId } = req.params;
  const updatedInvoice = await invoiceService.updateInvoice(
    invoiceId,
    req.body,
  );
  res.status(httpStatus.OK).send({ invoice: updatedInvoice });
});

// Delete invoice
const deleteInvoice = catchAsync(async (req, res) => {
  const { invoiceId } = req.params;
  const response = await invoiceService.deleteInvoice(invoiceId);
  res.status(httpStatus.OK).send(response); // { message: 'Invoice deleted successfully' }
});

module.exports = {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
};
