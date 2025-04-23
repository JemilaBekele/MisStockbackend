const mongoose = require('mongoose');
const toJson = require('@meanie/mongoose-to-json');

const unitSchema = mongoose.Schema(
    {
      unitNumber: {
        type: String,
        required: true,
        trim: true,
      },
      areaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Area',
        required: true,
      },
      type: {
        type: String,
        enum: ['Apartment', 'OfficeSuite'],
        required: true,
      },
      roomIds: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Space',
        },
      ],
      totalAreaSqM: {
        type: Number,
        required: true,
      },
      status: {
        type: String,
        enum: ['Occupied', 'Available', 'Reserved'],
        default: 'Available',
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
  
  unitSchema.plugin(toJson);
  
  const Unit = mongoose.model('Unit', unitSchema);
  module.exports = Unit;
  