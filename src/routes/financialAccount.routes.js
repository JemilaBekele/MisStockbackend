const express = require('express');

const router = express.Router();
const validate = require('../middlewares/validate');
const { FinancialAccountValidation } = require('../validations');
const { FinancialAccountController } = require('../controllers');
const auth = require('../middlewares/auth');

// Financial Account Routes

// Create a financeial account
router.post(
  '/api/financialaccount',
  auth,
  validate(FinancialAccountValidation.createFinancialAccountSchema),
  FinancialAccountController.createFinancialAccount,
);

// Get all financial accounts
router.get(
  '/api/financial-accounts',
  auth,
  FinancialAccountController.getAllFinancialAccounts,
);

// Get a single financial account by ID
router.get(
  '/api/financial-account/:accountId',
  auth,
  FinancialAccountController.getFinancialAccountById,
);

// Update a financial account
router.put(
  '/api/financial-account/:accountId',
  auth,
  validate(FinancialAccountValidation.updateFinancialAccountSchema),
  FinancialAccountController.updateFinancialAccount,
);

// Delete a financial account
router.delete(
  '/api/financial-account/:accountId',
  auth,
  FinancialAccountController.deleteFinancialAccount,
);

module.exports = router;
