const Joi = require('joi');

// Create Area Validation
const createAreaSchema = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    type: Joi.string()
      .valid('Residential', 'Commercial', 'Basement', 'Parking', 'Roof')
      .required(),
    floorLevel: Joi.number().required(),
    notes: Joi.string().optional(),
  }),
};

// Update Area Validation
const updateAreaSchema = {
  body: Joi.object().keys({
    name: Joi.string().optional(),
    type: Joi.string()
      .valid('Residential', 'Commercial', 'Basement', 'Parking', 'Roof')
      .optional(),
    floorLevel: Joi.number().optional(),
    notes: Joi.string().optional(),
  }),
};

module.exports = {
  createAreaSchema,
  updateAreaSchema,
};
