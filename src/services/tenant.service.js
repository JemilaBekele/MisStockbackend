/* eslint-disable no-unused-expressions */
const httpStatus = require('http-status');
const { RateLimiterMongo } = require('rate-limiter-flexible');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const tenantService = require('./tenant.service');
const tokenService = require('./token.service');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const config = require('../config/config');
const { Tenant } = require('../models');
const EventEmitter = require('../utils/EventEmitter');

const login = async (email, password, ipAddr) => {
  const rateLimiterOptions = {
    storeClient: mongoose.connection,
    dbName: mongoose.connection.name,
    blockDuration: 60 * 60 * 24, // Block for 1 day
  };

  const emailIpBruteLimiter = new RateLimiterMongo({
    ...rateLimiterOptions,
    points: config.rateLimiter.maxAttemptsByIpUsername,
    duration: 60 * 10, // 10 minutes
  });

  const slowerBruteLimiter = new RateLimiterMongo({
    ...rateLimiterOptions,
    points: config.rateLimiter.maxAttemptsPerDay,
    duration: 60 * 60 * 24,
  });

  const emailBruteLimiter = new RateLimiterMongo({
    ...rateLimiterOptions,
    points: config.rateLimiter.maxAttemptsPerEmail,
    duration: 60 * 60 * 24,
  });

  const promises = [slowerBruteLimiter.consume(ipAddr)];

  const tenant = await tenantService.getTenantByEmail(email);
  if (!tenant || !(await tenant.isPasswordMatch(password))) {
    tenant &&
      promises.push(
        emailIpBruteLimiter.consume(`${email}_${ipAddr}`),
        emailBruteLimiter.consume(email),
      );
    await Promise.all(promises);
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }

  return tenant;
};

const refreshAuthToken = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(
      refreshToken,
      tokenTypes.REFRESH,
    );
    const tenant = await tenantService.getTenantById(refreshTokenDoc.user);
    if (!tenant) {
      throw new Error();
    }
    await refreshTokenDoc.remove();
    return tokenService.generateAuthTokens(tenant.id);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

const createTenant = async (tenantBody) => {
  if (await Tenant.isEmailTaken(tenantBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email is already taken');
  }
  const tenant = await Tenant.create(tenantBody);
  EventEmitter.emit('signup', tenant);
  return tenant;
};

const getTenantByEmail = async (email) => {
  const tenant = await Tenant.findOne({ email });
  return tenant;
};

const getTenantById = async (id) => {
  const tenant = await Tenant.findById(id);
  return tenant;
};

const updateTenant = async (id, updateBody) => {
  const tenant = await getTenantById(id);
  if (!tenant) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Tenant not found');
  }
  if (updateBody.email && updateBody.email !== tenant.email) {
    if (await Tenant.isEmailTaken(updateBody.email)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email is already taken');
    }
  }
  Object.assign(tenant, updateBody);
  await tenant.save();
  return tenant;
};

const changePassword = async (id, oldPassword, newPassword) => {
  const tenant = await getTenantById(id);
  if (!tenant) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Tenant not found');
  }
  const isMatch = await tenant.isPasswordMatch(oldPassword);
  if (!isMatch) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Old password is incorrect');
  }
  tenant.password = await bcrypt.hash(newPassword, 8);
  await tenant.save();
  return tenant;
};

const deleteTenant = async (id) => {
  const tenant = await getTenantById(id);
  if (!tenant) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Tenant not found');
  }
  await tenant.remove();
  return { message: 'Tenant deleted successfully' };
};

module.exports = {
  login,
  refreshAuthToken,
  createTenant,
  getTenantByEmail,
  getTenantById,
  updateTenant,
  changePassword,
  deleteTenant,
};
