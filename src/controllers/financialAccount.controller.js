const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const financialAccountService = require('../services');

// Create a new financial account
const createFinancialAccount = catchAsync(async (req, res) => {
  const account = await financialAccountService.createFinancialAccount(
    req.body,
  );
  res.status(httpStatus.CREATED).send({ account });
});

// Get all financial accounts
const getAllFinancialAccounts = catchAsync(async (req, res) => {
  const result = await financialAccountService.getAllFinancialAccounts();
  res.status(httpStatus.OK).send(result); // { accounts, count }
});

// Get financial account by ID
const getFinancialAccountById = catchAsync(async (req, res) => {
  const { accountId } = req.params;
  const account = await financialAccountService.getFinancialAccountById(
    accountId,
  );
  if (!account) {
    throw new ApiError(httpStatus.NOT_FOUND, 'FinancialAccount not found');
  }
  res.status(httpStatus.OK).send({ account });
});

// Update financial account
const updateFinancialAccount = catchAsync(async (req, res) => {
  const { accountId } = req.params;
  const updatedAccount = await financialAccountService.updateFinancialAccount(
    accountId,
    req.body,
  );
  res.status(httpStatus.OK).send({ account: updatedAccount });
});

// Delete financial account
const deleteFinancialAccount = catchAsync(async (req, res) => {
  const { accountId } = req.params;
  const response = await financialAccountService.deleteFinancialAccount(
    accountId,
  );
  res.status(httpStatus.OK).send(response); // { message: 'FinancialAccount deleted successfully' }
});

module.exports = {
  createFinancialAccount,
  getAllFinancialAccounts,
  getFinancialAccountById,
  updateFinancialAccount,
  deleteFinancialAccount,
};
