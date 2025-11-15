const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { permissionService } = require('../services');

// Create Permission
const createPermission = catchAsync(async (req, res) => {
  const permission = await permissionService.createPermission(req.body);
  res.status(httpStatus.CREATED).send({
    success: true,
    message: 'Permission created successfully',
    permission,
  });
});

// Get Permission by ID
const getPermissionById = catchAsync(async (req, res) => {
  const permission = await permissionService.getPermissionById(req.params.id, {
    includeRoles: req.query.includeRoles === 'true',
  });
  res.status(httpStatus.OK).send(permission);
});
const getPermissionsByRoleName = catchAsync(async (req, res) => {
  const { roleName } = req.params; // assume role name passed as URL param
  const permissions = await permissionService.getPermissionsByRoleName(
    roleName,
  );

  res.status(httpStatus.OK).send({ permissions });
});
// Get Permission by Name
const getPermissionByName = catchAsync(async (req, res) => {
  const permission = await permissionService.getPermissionByName(
    req.params.name,
  );
  res.status(httpStatus.OK).send(permission);
});

// Get all Permissions
const getAllPermissions = catchAsync(async (req, res) => {
  const { sortBy, sortOrder, includeRoles } = req.query;
  const { permissions, count } = await permissionService.getAllPermissions(
    {},
    {
      sortBy,
      sortOrder,
      includeRoles: includeRoles === 'true',
    },
  );
  res.status(httpStatus.OK).send({ permissions, count });
});

// Update Permission
const updatePermission = catchAsync(async (req, res) => {
  const permission = await permissionService.updatePermission(
    req.params.id,
    req.body,
  );
  res.status(httpStatus.OK).send({
    success: true,
    message: 'Permission updated successfully',
    permission,
  });
});

// Delete Permission
const deletePermission = catchAsync(async (req, res) => {
  await permissionService.deletePermission(req.params.id);
  res.status(httpStatus.OK).send({
    success: true,
    message: 'Permission deleted successfully',
  });
});

module.exports = {
  createPermission,
  getPermissionById,
  getPermissionByName,
  getAllPermissions,
  updatePermission,
  deletePermission,
  getPermissionsByRoleName,
};
