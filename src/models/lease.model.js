const mongoose = require('mongoose');
const toJson = require('@meanie/mongoose-to-json');

const leaseSchema = mongoose.Schema(
  {
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
      required: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      default: null,
    },
    rentAmount: {
      type: Number,
      required: true,
    },
    paymentCycle: {
      type: String,
      enum: ['Monthly', 'Quarterly', 'Annually'],
      required: true,
    },
    deposit: {
      amount: {
        type: Number,
        required: true,
      },
      paid: {
        type: Boolean,
        default: false,
      },
      date: {
        type: Date,
      },
    },
    status: {
      type: String,
      enum: ['Active', 'Terminated', 'Pending', 'Expired'],
      default: 'Pending',
    },
    terminationDate: {
      type: Date,
    },
    paymentSchedule: [
      {
        dueDate: Date,
        paidDate: Date,
        amount: Number,
        status: {
          type: String,
          enum: ['Paid', 'Unpaid', 'Overdue'],
        },
      },
    ],
    customTerms: [
      {
        type: String,
        trim: true,
      },
    ],
    documents: [
      {
        name: String,
        url: String,
        uploadedAt: Date,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

leaseSchema.plugin(toJson);

const Lease = mongoose.model('Lease', leaseSchema);
module.exports = Lease;
