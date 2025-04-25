const mongoose = require('mongoose');
const toJson = require('@meanie/mongoose-to-json');

const inventoryStockSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
      required: true,
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryLocation',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Available', 'In Use', 'Reserved', 'Broken', 'Lost', 'Disposed'],
      default: 'Available',
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

inventoryStockSchema.plugin(toJson);

const InventoryStock = mongoose.model('InventoryStock', inventoryStockSchema);

module.exports = InventoryStock;
