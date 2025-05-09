const mongoose = require('mongoose');
const toJson = require('@meanie/mongoose-to-json');

const expenseCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    isRecurring: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

expenseCategorySchema.plugin(toJson);

const ExpenseCategory = mongoose.model(
  'ExpenseCategory',
  expenseCategorySchema,
);
module.exports = ExpenseCategory;
