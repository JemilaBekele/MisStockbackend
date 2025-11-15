const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { roleService } = require('../services');

// Create Role
const createRole = catchAsync(async (req, res) => {
  const role = await roleService.createRole(req.body);
  res.status(httpStatus.CREATED).send({
    success: true,
    message: 'Role created successfully',
    role,
  });
});

// Get Role by ID
const getRoleById = catchAsync(async (req, res) => {
  const role = await roleService.getRoleById(req.params.id, {
    includePermissions: true,
    includeUsers: req.query.includeUsers === 'true',
  });
  res.status(httpStatus.OK).send(role);
});

// Get Role by Name
const getRoleByName = catchAsync(async (req, res) => {
  const role = await roleService.getRoleByName(req.params.name);
  res.status(httpStatus.OK).send(role);
});

// Get all Roles
const getAllRoles = catchAsync(async (req, res) => {
  const { sortBy, sortOrder, includePermissions, includeUsers } = req.query;
  const { roles, count } = await roleService.getAllRoles(
    {},
    {
      sortBy,
      sortOrder,
      includePermissions: includePermissions === 'true',
      includeUsers: includeUsers === 'true',
    },
  );
  res.status(httpStatus.OK).send({ roles, count });
});

// Update Role
const updateRole = catchAsync(async (req, res) => {
  const role = await roleService.updateRole(req.params.id, req.body);
  res.status(httpStatus.OK).send({
    success: true,
    message: 'Role updated successfully',
    role,
  });
});

// Delete Role
const deleteRole = catchAsync(async (req, res) => {
  await roleService.deleteRole(req.params.id);
  res.status(httpStatus.OK).send({
    success: true,
    message: 'Role deleted successfully',
  });
});

// Assign Permissions to Role
const assignPermissions = catchAsync(async (req, res) => {
  const role = await roleService.assignPermissions(
    req.params.roleId,
    req.body.permissionIds,
  );
  res.status(httpStatus.OK).send({
    success: true,
    message: 'Permissions assigned successfully',
    role,
  });
});

// Add Permission to Role
const addPermission = catchAsync(async (req, res) => {
  const rolePermission = await roleService.addPermissionToRole(
    req.params.roleId,
    req.params.permissionId,
  );
  res.status(httpStatus.OK).send({
    success: true,
    message: 'Permission added to role successfully',
    rolePermission,
  });
});

// Remove Permission from Role
const removePermission = catchAsync(async (req, res) => {
  await roleService.removePermissionFromRole(
    req.params.roleId,
    req.params.permissionId,
  );
  res.status(httpStatus.OK).send({
    success: true,
    message: 'Permission removed from role successfully',
  });
});

module.exports = {
  createRole,
  getRoleById,
  getRoleByName,
  getAllRoles,
  updateRole,
  deleteRole,
  assignPermissions,
  addPermission,
  removePermission,
};
