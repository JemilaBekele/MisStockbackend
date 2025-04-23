const Joi = require('joi');
const { password } = require('./custom.validation');
const loginSchema = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};
const refreshTokenSchema = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

// Create User Validation
const createTenantSchema = {
    body: Joi.object().keys({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])')).required()
        .messages({
          'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
        }),
      phone: Joi.string().optional(),
      address: Joi.string().optional(),
      note: Joi.string().optional(),
      status: Joi.string()
        .valid('Active', 'Inactive', 'Suspended')
        .default('Active'),
    }),
  };
  

// Update User Validation
const updateTenantSchema = {
    body: Joi.object().keys({
      name: Joi.string().optional(),
      email: Joi.string().email().optional(),
      phone: Joi.string().optional(),
      address: Joi.string().optional(),
      note: Joi.string().optional(),
      status: Joi.string()
        .valid('Active', 'Inactive', 'Suspended')
        .optional(),
    }),
  };
  

// Change Password Validation
const changePasswordSchema = {
    body: Joi.object().keys({
      oldPassword: Joi.string().min(8).required(),
      newPassword: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])')).required()
        .messages({
          'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
        }),
    }),
  };
  

module.exports = {
  createTenantSchema,
  updateTenantSchema,
  changePasswordSchema,
  loginSchema,
  refreshTokenSchema,
};
