const mongoose = require('mongoose');
const toJson = require('@meanie/mongoose-to-json');

const invoiceSchema = new mongoose.Schema(
  {
    issuedTo: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'issuedToModel', // Can be Tenant or Buyer
      required: true,
    },
    issuedToModel: {
      type: String,
      enum: ['Tenant', 'Buyer'],
      required: true,
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee', // Or you can use 'System' as a string in the future
      required: true,
    },
    type: {
      type: String,
      enum: ['Rent', 'Sale', 'Service', 'Penalty'],
      required: true,
    },
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
    },
    linkedLeaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lease',
    },
    linkedSaleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sale',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Unpaid', 'Partially Paid', 'Paid', 'Overdue'],
      default: 'Unpaid',
    },
    dueDate: {
      type: Date,
      required: true,
    },
    paymentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
      },
    ],
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

invoiceSchema.plugin(toJson);

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
