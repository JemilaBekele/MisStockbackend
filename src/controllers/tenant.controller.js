const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { tenantService, tokententantService } = require('../services');

// Register tenant
const createTenant = catchAsync(async (req, res) => {
  const tenant = await tenantService.createTenant(req.body);
  const tokens = await tokententantService.generateAuthTokens(tenant.id);
  res.status(httpStatus.CREATED).send({ tenant, tokens });
});

// Login tenant
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const tenant = await tenantService.login(
    email,
    password,
    req.connection.remoteAddress,
  );
  const tokens = await tokententantService.generateAuthTokens(tenant.id);
  res.status(httpStatus.OK).send({ tenant, tokens });
});

// Refresh token
const refreshToken = catchAsync(async (req, res) => {
  const tokens = await tenantService.refreshAuthToken(req.body.refreshToken);
  res.status(httpStatus.OK).send({ ...tokens });
});

// Update tenant details
const updateTenant = catchAsync(async (req, res) => {
  const { tenantId } = req.params;
  const updatedTenant = await tenantService.updateTenant(tenantId, req.body);
  res.status(httpStatus.OK).send({ tenant: updatedTenant });
});

// Change tenant password
const changePassword = catchAsync(async (req, res) => {
  const { tenantId } = req.params;
  const { oldPassword, newPassword } = req.body;
  const updatedTenant = await tenantService.changePassword(
    tenantId,
    oldPassword,
    newPassword,
  );
  res.status(httpStatus.OK).send({ tenant: updatedTenant });
});

// Delete tenant
const deleteTenant = catchAsync(async (req, res) => {
  const { tenantId } = req.params;
  const result = await tenantService.deleteTenant(tenantId);
  res.status(httpStatus.OK).send(result);
});

module.exports = {
  createTenant,
  login,
  refreshToken,
  updateTenant,
  changePassword,
  deleteTenant,
};
