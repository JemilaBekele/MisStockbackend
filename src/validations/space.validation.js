const Joi = require('joi');

// Create Space Validation
const createSpaceSchema = {
  body: Joi.object().keys({
    areaId: Joi.string().required(), // Validating ObjectId type as a string
    spaceNumber: Joi.string().required().trim(),
    type: Joi.string()
      .valid('Room', 'Shop', 'Apartment', 'Storage', 'ParkingSlot')
      .required(),
    sizeSqM: Joi.number().required(),
    status: Joi.string()
      .valid('Available', 'Occupied', 'Reserved', 'Blocked')
      .default('Available'),
    features: Joi.array().items(Joi.string()).optional(), 
    linkedToUnitId: Joi.string().optional(), // Validating ObjectId type as a string
    notes: Joi.string().optional().trim(),
  }),
};

// Update Space Validation
const updateSpaceSchema = {
  body: Joi.object().keys({
    areaId: Joi.string().optional(), // Validating ObjectId type as a string
    spaceNumber: Joi.string().optional().trim(),
    type: Joi.string()
      .valid('Room', 'Shop', 'Apartment', 'Storage', 'ParkingSlot')
      .optional(),
    sizeSqM: Joi.number().optional(),
    status: Joi.string()
      .valid('Available', 'Occupied', 'Reserved', 'Blocked')
      .optional(),
    features: Joi.array().items(Joi.string()).optional(),
    linkedToUnitId: Joi.string().optional(), // Validating ObjectId type as a string
    notes: Joi.string().optional().trim(),
  }),
};

module.exports = {
  createSpaceSchema,
  updateSpaceSchema,
};
