const Joi = require('joi');
const { password } = require('./custom.validation');

// Create User Validation
const createUserSchema = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.custom(password).required(),
    role: Joi.string()
      .valid('Resident', 'ShopOwner', 'Maintenance', 'Accountant', 'Admin')
      .default('Resident'),
    phone: Joi.string().optional(),
    status: Joi.string()
      .valid('Active', 'Inactive', 'Suspended')
      .default('Active'),
  }),
};

// Update User Validation
const updateUserSchema = {
  body: Joi.object().keys({
    name: Joi.string().optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
    status: Joi.string()
      .valid('Active', 'Inactive', 'Suspended')
      .optional(),
    role: Joi.string()
      .valid('Resident', 'ShopOwner', 'Maintenance', 'Accountant', 'Admin')
      .optional(),
  }),
};

// Change Password Validation
const changePasswordSchema = {
  body: Joi.object().keys({
    oldPassword: Joi.string().min(8).required(),
    newPassword: Joi.string().min(8).custom(password).required(),
  }),
};

module.exports = {
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
};
