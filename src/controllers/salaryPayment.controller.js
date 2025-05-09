const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { salaryPaymentService } = require('../services');

// Create salary payment
const createSalaryPayment = catchAsync(async (req, res) => {
  const payment = await salaryPaymentService.createSalaryPayment(req.body);
  res.status(httpStatus.CREATED).send({ payment });
});

// Get all salary payments
const getAllSalaryPayments = catchAsync(async (req, res) => {
  const result = await salaryPaymentService.getAllSalaryPayments();
  res.status(httpStatus.OK).send(result); // { payments, count }
});

// Get salary payment by ID
const getSalaryPaymentById = catchAsync(async (req, res) => {
  const { paymentId } = req.params;
  const payment = await salaryPaymentService.getSalaryPaymentById(paymentId);
  if (!payment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'SalaryPayment not found');
  }
  res.status(httpStatus.OK).send({ payment });
});

// Get salary payments by employee ID
const getSalaryPaymentsByEmployee = catchAsync(async (req, res) => {
  const { employeeId } = req.params;
  const payments = await salaryPaymentService.getSalaryPaymentsByEmployee(
    employeeId,
  );
  res.status(httpStatus.OK).send({ payments });
});

// Get salary payments by month
const getSalaryPaymentsByMonth = catchAsync(async (req, res) => {
  const { month } = req.params;
  const payments = await salaryPaymentService.getSalaryPaymentsByMonth(month);
  res.status(httpStatus.OK).send({ payments });
});

// Update salary payment
const updateSalaryPayment = catchAsync(async (req, res) => {
  const { paymentId } = req.params;
  const updated = await salaryPaymentService.updateSalaryPayment(
    paymentId,
    req.body,
  );
  res.status(httpStatus.OK).send({ payment: updated });
});

// Delete salary payment
const deleteSalaryPayment = catchAsync(async (req, res) => {
  const { paymentId } = req.params;
  const result = await salaryPaymentService.deleteSalaryPayment(paymentId);
  res.status(httpStatus.OK).send(result); // { message: 'SalaryPayment deleted successfully' }
});

module.exports = {
  createSalaryPayment,
  getAllSalaryPayments,
  getSalaryPaymentById,
  getSalaryPaymentsByEmployee,
  getSalaryPaymentsByMonth,
  updateSalaryPayment,
  deleteSalaryPayment,
};
