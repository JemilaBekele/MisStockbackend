const express = require('express');
const validate = require('../middlewares/validate');
const { transactionController } = require('../controllers');
const { transactionValidation } = require('../validations');
const auth = require('../middlewares/auth');

const router = express.Router();

// Create transaction
router.post(
  '/api/transaction',
  auth,
  validate(transactionValidation.createTransactionSchema),
  transactionController.createTransaction,
);

// Get all transactions
router.get('/api/transaction', auth, transactionController.getAllTransactions);

// Get transaction by ID
router.get(
  '/api/transaction/:transactionId',
  auth,
  transactionController.getTransactionById,
);

// Get transactions by account
router.get(
  '/api/transaction/account/:accountId',
  auth,
  transactionController.getTransactionsByAccount,
);

// Get transactions by status
router.get(
  '/api/transaction/status/:status',
  auth,
  transactionController.getTransactionsByStatus,
);

// Update transaction
router.put(
  '/api/transaction/:transactionId',
  auth,
  validate(transactionValidation.updateTransactionSchema),
  transactionController.updateTransaction,
);

// Delete transaction
router.delete(
  '/api/transaction/:transactionId',
  auth,
  transactionController.deleteTransaction,
);

module.exports = router;
