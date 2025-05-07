const mongoose = require('mongoose');
const toJson = require('@meanie/mongoose-to-json');

const inventoryRequestApprovalSchema = new mongoose.Schema(
  {
    approverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
  { _id: false },
);

const inventoryItemLocationSchema = new mongoose.Schema(
  {
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false },
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
    // Main quantity (optional, can use itemLocations instead)
    quantity: {
      type: Number,
      min: 1,
      required() {
        return !this.itemLocations || this.itemLocations.length === 0;
      },
    },
    // New field for location-specific quantities
    itemLocations: {
      type: [inventoryItemLocationSchema],
      validate: {
        validator(arr) {
          // Either quantity or itemLocations must be provided, but not both
          return !(this.quantity && arr && arr.length > 0);
        },
        message: 'Cannot specify both quantity and itemLocations',
      },
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Kept for backward compatibility (single location)
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
      required() {
        return !this.itemLocations || this.itemLocations.length === 0;
      },
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

// Calculate total quantity from itemLocations if present
inventoryRequestSchema.virtual('totalQuantity').get(function () {
  if (this.itemLocations && this.itemLocations.length > 0) {
    return this.itemLocations.reduce((sum, loc) => sum + loc.quantity, 0);
  }
  return this.quantity;
});

// Ensure virtuals are included when converting to JSON
inventoryRequestSchema.set('toJSON', { virtuals: true });

inventoryRequestSchema.plugin(toJson);

const InventoryRequest = mongoose.model(
  'InventoryRequest',
  inventoryRequestSchema,
);

module.exports = InventoryRequest;
