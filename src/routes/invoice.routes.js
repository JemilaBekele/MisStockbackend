const express = require('express');

const router = express.Router();
const validate = require('../middlewares/validate');
const { InvoiceValidation } = require('../validations');
const { InvoiceController } = require('../controllers');
const auth = require('../middlewares/auth');

// Invoice Routes

// Create an invoice
router.post(
  '/api/invoice',
  auth,
  validate(InvoiceValidation.createInvoiceSchema),
  InvoiceController.createInvoice,
);

// Get all invoices
router.get('/api/invoices', auth, InvoiceController.getAllInvoices);

// Get a single invoice by ID
router.get('/api/invoice/:invoiceId', auth, InvoiceController.getInvoiceById);

// Update an invoice
router.put(
  '/api/invoice/:invoiceId',
  auth,
  validate(InvoiceValidation.updateInvoiceSchema),
  InvoiceController.updateInvoice,
);

// Delete an invoice
router.delete('/api/invoice/:invoiceId', auth, InvoiceController.deleteInvoice);

module.exports = router;
