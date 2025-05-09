const httpStatus = require('http-status');
const { FinancialAccount } = require('../models'); // Adjust path as needed
const ApiError = require('../utils/ApiError');

// Create FinancialAccount
const createFinancialAccount = async (accountBody) => {
  const account = await FinancialAccount.create(accountBody);
  return account;
};

// Get FinancialAccount by ID
const getFinancialAccountById = async (id) => {
  const account = await FinancialAccount.findById(id);
  if (!account) {
    throw new ApiError(httpStatus.NOT_FOUND, 'FinancialAccount not found');
  }
  return account;
};

// Get all FinancialAccounts
const getAllFinancialAccounts = async () => {
  const accounts = await FinancialAccount.find().sort({ name: 1 });
  return {
    accounts,
    count: accounts.length,
  };
};

// Update FinancialAccount
const updateFinancialAccount = async (id, updateBody) => {
  const account = await getFinancialAccountById(id);

  Object.assign(account, updateBody);
  await account.save();
  return account;
};

// Delete FinancialAccount
const deleteFinancialAccount = async (id) => {
  const account = await getFinancialAccountById(id);

  await account.remove();
  return { message: 'FinancialAccount deleted successfully' };
};

module.exports = {
  createFinancialAccount,
  getFinancialAccountById,
  getAllFinancialAccounts,
  updateFinancialAccount,
  deleteFinancialAccount,
};
