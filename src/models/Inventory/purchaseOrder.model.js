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
    orderedAt: { type: Date, default: Date.now },
    receivedAt: { type: Date },
    status: {
      type: String,
      enum: ['Pending', 'Partially Received', 'Received', 'Cancelled'],
      default: 'Pending',
    },
    notes: { type: String, trim: true },
    shortCode: { type: String, unique: true, trim: true },
    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'InventoryItem',
          required: true,
        },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        totalPrice: { type: Number },
        locationId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Unit',
        },
      },
    ],
  },
  { timestamps: true },
);

purchaseOrderSchema.pre('save', async function (next) {
  const purchaseOrder = this;

  if (purchaseOrder.items && Array.isArray(purchaseOrder.items)) {
    purchaseOrder.items = purchaseOrder.items.map((item) => ({
      ...item,
      totalPrice: item.quantity * item.unitPrice,
    }));
  }

  if (!purchaseOrder.shortCode) {
    const count = await mongoose.model('PurchaseOrder').countDocuments();
    purchaseOrder.shortCode = `PO-${String(count + 1).padStart(4, '0')}`;
  }

  next();
});

purchaseOrderSchema.plugin(toJson);

const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);

module.exports = PurchaseOrder;
