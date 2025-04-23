const mongoose = require('mongoose');
const toJson = require('@meanie/mongoose-to-json');

const featureSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    }
  },
  {
    timestamps: true,
  }
);

featureSchema.plugin(toJson);

const Feature = mongoose.model('Feature', featureSchema);
module.exports = Feature;
