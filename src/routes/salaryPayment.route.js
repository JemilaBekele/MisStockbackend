const express = require('express');
const validate = require('../middlewares/validate');
const { salaryPaymentController } = require('../controllers');
const { salaryPaymentValidation } = require('../validations');
const auth = require('../middlewares/auth');

const router = express.Router();

// Create salarypayment
router.post(
  '/api/salarypayment/payment',
  auth,
  validate(salaryPaymentValidation.createSalaryPaymentSchema),
  salaryPaymentController.createSalaryPayment,
);

// Get all salary payments
router.get(
  '/api/salarypayments',
  auth,
  salaryPaymentController.getAllSalaryPayments,
);

// Get salary payment by ID
router.get(
  '/api/salarypayment/:paymentId',
  auth,
  salaryPaymentController.getSalaryPaymentById,
);

// Get salary payments by employee ID
router.get(
  '/api/salarypayment/employee/:employeeId',
  auth,
  salaryPaymentController.getSalaryPaymentsByEmployee,
);

// Get salary payments by month
router.get(
  '/month/:month',
  auth,
  salaryPaymentController.getSalaryPaymentsByMonth,
);

// Update salary payment
router.put(
  '/api/salarypayment/:paymentId',
  auth,
  validate(salaryPaymentValidation.updateSalaryPaymentSchema),
  salaryPaymentController.updateSalaryPayment,
);

// Delete salary payment
router.delete(
  '/api/salarypayment/:paymentId',
  auth,
  salaryPaymentController.deleteSalaryPayment,
);

module.exports = router;
