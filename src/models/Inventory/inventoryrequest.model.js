const mongoose = require('mongoose');
const toJson = require('@meanie/mongoose-to-json');

const inventoryRequestApprovalSchema = new mongoose.Schema(
  {
    approverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Assuming your employees are in 'User' collection
      required: true,
    },
    decision: {
      type: String,
      enum: ['Approved', 'Rejected', 'Pending'],
      default: 'Pending',
    },
    decisionDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { _id: false }, // No _id for subdocument unless you want it
);

const inventoryRequestSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Purchase', 'StockWithdrawal'],
      required: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
    },
    reason: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Fulfilled', 'Cancelled'],
      default: 'Pending',
    },
    approvals: [inventoryRequestApprovalSchema],
  },
  {
    timestamps: true,
  },
);

inventoryRequestSchema.plugin(toJson);

const InventoryRequest = mongoose.model(
  'InventoryRequest',
  inventoryRequestSchema,
);

module.exports = InventoryRequest;
