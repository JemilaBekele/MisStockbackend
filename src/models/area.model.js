const mongoose = require('mongoose');
const toJson = require('@meanie/mongoose-to-json');

const areaSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['Residential', 'Commercial', 'Basement', 'Parking', 'Roof'],
      required: true,
    },
    floorLevel: {
      type: Number,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

areaSchema.plugin(toJson);

const Area = mongoose.model('Area', areaSchema);
module.exports = Area;
