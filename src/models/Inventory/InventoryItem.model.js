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
    unitType: {
      type: String,
      enum: ['Consumable', 'Asset'],
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    assignedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    purchaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PurchaseOrder',
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
    },
    lastUsed: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Available', 'In Use', 'Broken', 'Lost', 'Disposed'],
      default: 'Available',
    },
  },
  {
    timestamps: true,
  },
);

inventoryItemSchema.plugin(toJson);

const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);

module.exports = InventoryItem;
