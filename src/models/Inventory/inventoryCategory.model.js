const mongoose = require('mongoose');
const toJson = require('@meanie/mongoose-to-json');

const inventoryCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    isAsset: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

inventoryCategorySchema.plugin(toJson);

const InventoryCategory = mongoose.model(
  'InventoryCategory',
  inventoryCategorySchema,
);

module.exports = InventoryCategory;
