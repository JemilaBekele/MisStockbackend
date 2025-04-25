const mongoose = require('mongoose');
const toJson = require('@meanie/mongoose-to-json');

const purchaseOrderSchema = new mongoose.Schema(
  {
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderedAt: {
      type: Date,
      default: Date.now,
    },
    receivedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Pending', 'Partially Received', 'Received', 'Cancelled'],
      default: 'Pending',
    },
    notes: {
      type: String,
      trim: true,
    },
    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'InventoryItem',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        unitPrice: {
          type: Number,
          required: true,
        },
        totalPrice: {
          type: Number,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Auto-calculate totalPrice for each item
purchaseOrderSchema.pre('save', function (next) {
  if (this.items && Array.isArray(this.items)) {
    this.items = this.items.map((item) => ({
      ...item,
      totalPrice: item.quantity * item.unitPrice,
    }));
  }
  next();
});

purchaseOrderSchema.plugin(toJson);

const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);

module.exports = PurchaseOrder;
