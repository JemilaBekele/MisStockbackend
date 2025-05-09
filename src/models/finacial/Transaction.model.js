const mongoose = require('mongoose');
const toJson = require('@meanie/mongoose-to-json');

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Income', 'Expense', 'Transfer'],
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    subCategory: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'BankTransfer', 'Cheque', 'MobileMoney'],
      required: true,
    },
    fromAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FinancialAccount',
    },
    toAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FinancialAccount',
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'paidByModel', // Can be tenant or buyer
    },
    paidByModel: {
      type: String,
      enum: ['Tenant', 'Buyer'],
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    },
    linkedTo: {
      leaseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lease',
      },
      unitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Unit',
      },
      employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
      },
      purchaseOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PurchaseOrder',
      },
      inventoryRequestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InventoryRequest',
      },
      invoiceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice',
      },
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    notes: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

transactionSchema.plugin(toJson);

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
