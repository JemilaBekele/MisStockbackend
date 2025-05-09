const httpStatus = require('http-status');
const Invoice = require('../models'); // Adjust path as needed
const ApiError = require('../utils/ApiError');

// Create Invoice
const createInvoice = async (invoiceBody) => {
  const invoice = await Invoice.create(invoiceBody);
  return invoice;
};

// Get Invoice by ID
const getInvoiceById = async (id) => {
  const invoice = await Invoice.findById(id)
    .populate('issuedTo')
    .populate('issuedBy')
    .populate('unitId')
    .populate('linkedLeaseId')
    .populate('linkedSaleId')
    .populate('paymentIds');

  if (!invoice) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invoice not found');
  }
  return invoice;
};

// Get all Invoices
const getAllInvoices = async () => {
  const invoices = await Invoice.find()
    .sort({ createdAt: -1 })
    .populate('issuedTo')
    .populate('issuedBy')
    .populate('unitId')
    .populate('linkedLeaseId')
    .populate('linkedSaleId')
    .populate('paymentIds');

  return {
    invoices,
    count: invoices.length,
  };
};

// Update Invoice
const updateInvoice = async (id, updateBody) => {
  const invoice = await getInvoiceById(id);

  Object.assign(invoice, updateBody);
  await invoice.save();
  return invoice;
};

// Delete Invoice
const deleteInvoice = async (id) => {
  const invoice = await getInvoiceById(id);

  await invoice.remove();
  return { message: 'Invoice deleted successfully' };
};

module.exports = {
  createInvoice,
  getInvoiceById,
  getAllInvoices,
  updateInvoice,
  deleteInvoice,
};
