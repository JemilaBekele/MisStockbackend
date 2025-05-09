const httpStatus = require('http-status');
const { Transaction } = require('../models'); // Adjust path as needed
const ApiError = require('../utils/ApiError');

// Create transaction
const createTransaction = async (transactionBody) => {
  const transaction = await Transaction.create(transactionBody);
  return transaction;
};

// Get transaction by ID
const getTransactionById = async (id) => {
  const transaction = await Transaction.findById(id)
    .populate('fromAccountId')
    .populate('toAccountId')
    .populate('paidBy')
    .populate('receivedBy')
    .populate('linkedTo.leaseId')
    .populate('linkedTo.unitId')
    .populate('linkedTo.employeeId')
    .populate('linkedTo.purchaseOrderId')
    .populate('linkedTo.inventoryRequestId')
    .populate('linkedTo.invoiceId');

  if (!transaction) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Transaction not found');
  }

  return transaction;
};

// Get all transactions
const getAllTransactions = async () => {
  const transactions = await Transaction.find()
    .sort({ createdAt: -1 })
    .populate('fromAccountId')
    .populate('toAccountId')
    .populate('paidBy')
    .populate('receivedBy');

  return {
    transactions,
    count: transactions.length,
  };
};

// Get transactions by account
const getTransactionsByAccount = async (accountId) => {
  const transactions = await Transaction.find({
    $or: [{ fromAccountId: accountId }, { toAccountId: accountId }],
  })
    .sort({ date: -1 })
    .populate('paidBy')
    .populate('receivedBy');

  return transactions;
};

// Get transactions by status
const getTransactionsByStatus = async (status) => {
  const transactions = await Transaction.find({ status })
    .sort({ date: -1 })
    .populate('paidBy')
    .populate('receivedBy');

  return transactions;
};

// Update transaction
const updateTransaction = async (id, updateBody) => {
  const transaction = await getTransactionById(id);

  Object.assign(transaction, updateBody);
  await transaction.save();
  return transaction;
};

// Delete transaction
const deleteTransaction = async (id) => {
  const transaction = await getTransactionById(id);

  await transaction.remove();
  return { message: 'Transaction deleted successfully' };
};

module.exports = {
  createTransaction,
  getTransactionById,
  getAllTransactions,
  getTransactionsByAccount,
  getTransactionsByStatus,
  updateTransaction,
  deleteTransaction,
};
