const mongoose = require('mongoose');
const toJson = require('@meanie/mongoose-to-json');

const inventoryItemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryCategory',
      required: true,
    },
    details: {
      type: String,
      trim: true,
    },
    assignedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    purchaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PurchaseOrder',
    },
    lastUsed: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Available', 'In Use', 'Broken', 'Lost', 'Disposed'],
      default: 'Available',
    },
    stockCode: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

// Auto-generate stock code if missing
inventoryItemSchema.pre('save', async function (next) {
  if (!this.stockCode) {
    const prefix = this.itemName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 3);
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    this.stockCode = `${prefix}-${randomNumber}`;
  }
  next();
});

inventoryItemSchema.plugin(toJson);

const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);

module.exports = InventoryItem;
