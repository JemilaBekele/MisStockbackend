
const mongoose = require('mongoose');
const toJson = require('@meanie/mongoose-to-json');

const spaceSchema = mongoose.Schema(
    {
      areaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Area',
        required: true,
      },
      spaceNumber: {
        type: String,
        required: true,
        trim: true,
      },
      type: {
        type: String,
        enum: ['Room', 'Shop', 'Apartment', 'Storage', 'ParkingSlot'],
        required: true,
      },
      sizeSqM: {
        type: Number,
        required: true,
      },
      status: {
        type: String,
        enum: ['Available', 'Occupied', 'Reserved', 'Blocked'],
        default: 'Available',
      },
      features:  [
              {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Feature',
              },
            ],
      linkedToUnitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Unit',
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
  
  spaceSchema.plugin(toJson);
  
  const Space = mongoose.model('Space', spaceSchema);
  module.exports = Space;
  