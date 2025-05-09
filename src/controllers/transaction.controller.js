const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { transactionService } = require('../services');

// Create transaction
const createTransaction = catchAsync(async (req, res) => {
  const transaction = await transactionService.createTransaction(req.body);
  res.status(httpStatus.CREATED).send({ transaction });
});

// Get all transactions
const getAllTransactions = catchAsync(async (req, res) => {
  const result = await transactionService.getAllTransactions();
  res.status(httpStatus.OK).send(result); // { transactions, count }
});

// Get transaction by ID
const getTransactionById = catchAsync(async (req, res) => {
  const { transactionId } = req.params;
  const transaction = await transactionService.getTransactionById(
    transactionId,
  );
  if (!transaction) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Transaction not found');
  }
  res.status(httpStatus.OK).send({ transaction });
});

// Get transactions by account
const getTransactionsByAccount = catchAsync(async (req, res) => {
  const { accountId } = req.params;
  const transactions = await transactionService.getTransactionsByAccount(
    accountId,
  );
  res.status(httpStatus.OK).send({ transactions });
});

// Get transactions by status
const getTransactionsByStatus = catchAsync(async (req, res) => {
  const { status } = req.params;
  const transactions = await transactionService.getTransactionsByStatus(status);
  res.status(httpStatus.OK).send({ transactions });
});

// Update transaction
const updateTransaction = catchAsync(async (req, res) => {
  const { transactionId } = req.params;
  const updated = await transactionService.updateTransaction(
    transactionId,
    req.body,
  );
  res.status(httpStatus.OK).send({ transaction: updated });
});

// Delete transaction
const deleteTransaction = catchAsync(async (req, res) => {
  const { transactionId } = req.params;
  const result = await transactionService.deleteTransaction(transactionId);
  res.status(httpStatus.OK).send(result); // { message: 'Transaction deleted successfully' }
});

module.exports = {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  getTransactionsByAccount,
  getTransactionsByStatus,
  updateTransaction,
  deleteTransaction,
};
