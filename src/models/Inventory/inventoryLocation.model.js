const mongoose = require('mongoose');
const toJson = require('@meanie/mongoose-to-json');

const inventoryLocationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    floor: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['Storage', 'Office', 'Laboratory', 'Warehouse', 'Other'],
      required: true,
    },
    zone: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

inventoryLocationSchema.plugin(toJson);

const InventoryLocation = mongoose.model(
  'InventoryLocation',
  inventoryLocationSchema,
);

module.exports = InventoryLocation;
