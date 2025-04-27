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

// ✨ Pre-save middleware to generate `code` automatically
inventoryCategorySchema.pre('validate', async function (next) {
  if (!this.code && this.name) {
    const prefix = this.name
      .split(' ') // split name by spaces
      .map((word) => word.charAt(0)) // take first letter of each word
      .join('') // join together
      .toUpperCase(); // uppercase it

    // You can also add a random number to avoid conflicts
    const randomSuffix = Math.floor(1000 + Math.random() * 9000); // random 4-digit number

    this.code = `${prefix}-${randomSuffix}`;
  }
  next();
});

inventoryCategorySchema.plugin(toJson);

const InventoryCategory = mongoose.model(
  'InventoryCategory',
  inventoryCategorySchema,
);

module.exports = InventoryCategory;
