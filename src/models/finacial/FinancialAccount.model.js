const mongoose = require('mongoose');
const toJson = require('@meanie/mongoose-to-json');

const financialAccountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['Cash', 'Bank', 'MobileMoney'],
      required: true,
    },
    balance: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

financialAccountSchema.plugin(toJson);

const FinancialAccount = mongoose.model(
  'FinancialAccount',
  financialAccountSchema,
);
module.exports = FinancialAccount;
