const Joi = require('joi');


const createUnitSchema = {
  body: Joi.object().keys({
    unitNumber: Joi.string().required().trim(),
    areaId: Joi.string().required(), // Validating ObjectId type as a string
    type: Joi.string()
      .valid('Apartment', 'OfficeSuite')
      .required(),
    roomIds: Joi.array().items(Joi.string()).optional(), // Validating ObjectId type as a string
    totalAreaSqM: Joi.number().required(),
    status: Joi.string()
      .valid('Occupied', 'Available', 'Reserved')
      .default('Available'),
    notes: Joi.string().optional().trim(),
  }),
};

// Update Unit Validation
const updateUnitSchema = {
  body: Joi.object().keys({
    unitNumber: Joi.string().optional().trim(),
    areaId: Joi.string().optional(), // Validating ObjectId type as a string
    type: Joi.string()
      .valid('Apartment', 'OfficeSuite')
      .optional(),
    roomIds: Joi.array().items(Joi.string()).optional(), // Validating ObjectId type as a string
    totalAreaSqM: Joi.number().optional(),
    status: Joi.string()
      .valid('Occupied', 'Available', 'Reserved')
      .optional(),
    notes: Joi.string().optional().trim(),
  }),
};

module.exports = {
  createUnitSchema,
  updateUnitSchema,
};
