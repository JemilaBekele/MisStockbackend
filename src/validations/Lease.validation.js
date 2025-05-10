const Joi = require('joi');
const { objectId } = require('./custom.validation'); // Assume you have custom validation for ObjectId

// Create Lease Validation
const createLeaseSchema = {
  body: Joi.object().keys({
    unitId: Joi.string().custom(objectId).required(),
    tenantId: Joi.string().custom(objectId).required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).allow(null),
    rentAmount: Joi.number().positive().required(),
    paymentCycle: Joi.string()
      .valid('Monthly', 'Quarterly', 'Annually')
      .required(),
    deposit: Joi.object()
      .keys({
        amount: Joi.number().positive().required(),
        paid: Joi.boolean().default(false),
        date: Joi.date().iso().when('paid', {
          is: true,
          then: Joi.required(),
          otherwise: Joi.forbidden(),
        }),
      })
      .required(),
    paymentSchedule: Joi.array()
      .items(
        Joi.object().keys({
          dueDate: Joi.date().iso().required(),
          paidDate: Joi.date().iso().allow(null),
          amount: Joi.number().positive().required(),
          status: Joi.string()
            .valid('Paid', 'Unpaid', 'Overdue')
            .default('Unpaid'),
        }),
      )
      .optional(),
    customTerms: Joi.array().items(Joi.string().trim()).optional(),
    documents: Joi.array()
      .items(
        Joi.object().keys({
          name: Joi.string().required(),
          url: Joi.string().uri().required(),
          uploadedAt: Joi.date().iso().default(Date.now),
        }),
      )
      .optional(),
    createdBy: Joi.string().custom(objectId).required(),
  }),
};

// Update Lease Validation
const updateLeaseSchema = {
  body: Joi.object().keys({
    unitId: Joi.string().custom(objectId).forbidden(), // Can't change unit after creation
    tenantId: Joi.string().custom(objectId).forbidden(), // Can't change tenant after creation
    startDate: Joi.date().iso().forbidden(), // Can't change start date after creation
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).allow(null),
    rentAmount: Joi.number().positive(),
    paymentCycle: Joi.string().valid('Monthly', 'Quarterly', 'Annually'),
    deposit: Joi.object().keys({
      amount: Joi.number().positive(),
      paid: Joi.boolean(),
      date: Joi.date().iso().when('paid', {
        is: true,
        then: Joi.required(),
        otherwise: Joi.forbidden(),
      }),
    }),
    paymentSchedule: Joi.array()
      .items(
        Joi.object().keys({
          dueDate: Joi.date().iso().required(),
          paidDate: Joi.date().iso().allow(null),
          amount: Joi.number().positive().required(),
          status: Joi.string()
            .valid('Paid', 'Unpaid', 'Overdue')
            .default('Unpaid'),
        }),
      )
      .forbidden(), // Should be updated through separate endpoints
    customTerms: Joi.array().items(Joi.string().trim()),
    documents: Joi.array().items(
      Joi.object().keys({
        name: Joi.string().required(),
        url: Joi.string().uri().required(),
        uploadedAt: Joi.date().iso().default(Date.now),
      }),
    ),
    status: Joi.string()
      .valid('Active', 'Terminated', 'Pending', 'Expired')
      .forbidden(), // Status changes through dedicated endpoints
  }),
};

// Terminate Lease Validation
const terminateLeaseSchema = {
  body: Joi.object().keys({
    terminationDate: Joi.date().iso().required(),
    reason: Joi.string().required().min(10).max(500),
  }),
};

// Query Leases Validation
const queryLeasesSchema = {
  query: Joi.object().keys({
    unitId: Joi.string().custom(objectId),
    tenantId: Joi.string().custom(objectId),
    status: Joi.string().valid('Active', 'Terminated', 'Pending', 'Expired'),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
    'deposit.paid': Joi.boolean(),
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    sortBy: Joi.string().valid(
      'startDate:asc',
      'startDate:desc',
      'endDate:asc',
      'endDate:desc',
      'rentAmount:asc',
      'rentAmount:desc',
    ),
  }),
};

module.exports = {
  createLeaseSchema,
  updateLeaseSchema,
  terminateLeaseSchema,
  queryLeasesSchema,
};
