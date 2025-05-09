const httpStatus = require('http-status');
const { SalaryPayment } = require('../models'); // Adjust the path as needed
const ApiError = require('../utils/ApiError');

// Create salary payment
const createSalaryPayment = async (paymentBody) => {
  const payment = await SalaryPayment.create(paymentBody);
  return payment;
};

// Get salary payment by ID
const getSalaryPaymentById = async (id) => {
  const payment = await SalaryPayment.findById(id)
    .populate('employeeId')
    .populate('paymentTransactionId');

  if (!payment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'SalaryPayment not found');
  }

  return payment;
};

// Get all salary payments
const getAllSalaryPayments = async () => {
  const payments = await SalaryPayment.find()
    .sort({ createdAt: -1 })
    .populate('employeeId')
    .populate('paymentTransactionId');

  return {
    payments,
    count: payments.length,
  };
};

// Get salary payments by employee ID
const getSalaryPaymentsByEmployee = async (employeeId) => {
  const payments = await SalaryPayment.find({ employeeId })
    .sort({ month: -1 })
    .populate('paymentTransactionId');

  return payments;
};

// Get salary payments by month
const getSalaryPaymentsByMonth = async (month) => {
  const payments = await SalaryPayment.find({ month })
    .sort({ createdAt: -1 })
    .populate('employeeId')
    .populate('paymentTransactionId');

  return payments;
};

// Update salary payment
const updateSalaryPayment = async (id, updateBody) => {
  const payment = await getSalaryPaymentById(id);

  Object.assign(payment, updateBody);
  await payment.save();
  return payment;
};

// Delete salary payment
const deleteSalaryPayment = async (id) => {
  const payment = await getSalaryPaymentById(id);

  await payment.remove();
  return { message: 'SalaryPayment deleted successfully' };
};

module.exports = {
  createSalaryPayment,
  getSalaryPaymentById,
  getAllSalaryPayments,
  getSalaryPaymentsByEmployee,
  getSalaryPaymentsByMonth,
  updateSalaryPayment,
  deleteSalaryPayment,
};
