const mongoose = require('mongoose');
const toJson = require('@meanie/mongoose-to-json');

const salaryPaymentSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    month: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}$/, // YYYY-MM format
    },
    status: {
      type: String,
      enum: ['Pending', 'Paid'],
      required: true,
      default: 'Pending',
    },
    paymentTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    },
  },
  {
    timestamps: true,
  },
);

salaryPaymentSchema.plugin(toJson);

const SalaryPayment = mongoose.model('SalaryPayment', salaryPaymentSchema);
module.exports = SalaryPayment;
