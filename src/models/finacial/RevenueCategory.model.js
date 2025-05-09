const mongoose = require('mongoose');
const toJson = require('@meanie/mongoose-to-json');

const revenueCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

revenueCategorySchema.plugin(toJson);

const RevenueCategory = mongoose.model(
  'RevenueCategory',
  revenueCategorySchema,
);
module.exports = RevenueCategory;
