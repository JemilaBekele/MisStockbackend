const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const prisma = require('./prisma');

/**
 * Create a permission
 * @param {Object} permissionBody
 * @returns {Promise<Permission>}
 */
const createPermission = async (permissionBody) => {
  // Check if permission already exists
  const existingPermission = await prisma.permission.findUnique({
    where: { name: permissionBody.name },
  });

  if (existingPermission) {
    return existingPermission; // Return existing instead of throwing error
  }

  // Create new permission
  const permission = await prisma.permission.create({
    data: permissionBody,
  });
  return permission;
};

const getPermissionByName = async (name) => {
  const permission = await prisma.permission.findUnique({
    where: { name },
  });
  if (!permission) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Permission not found');
  }
  return permission;
};

/**
 * Get permission by ID
 * @param {string} id
 * @param {Object} options - Optional include options
 * @returns {Promise<Permission>}
 */
const getPermissionById = async (id, options = {}) => {
  const permission = await prisma.permission.findUnique({
    where: { id },
    include: {
      roles: options.includeRoles || false,
    },
  });

  if (!permission) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Permission not found');
  }

  return permission;
};
const getPermissionsByRoleName = async (roleName) => {
  // Find the role with permissions (only select permission names)
  const roleWithPermissions = await prisma.role.findUnique({
    where: { name: roleName },
    select: {
      permissions: {
        select: {
          permission: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!roleWithPermissions) {
    throw new ApiError(httpStatus.NOT_FOUND, `Role '${roleName}' not found`);
  }

  // Extract permission names
  const permissionNames = roleWithPermissions.permissions.map(
    (rp) => rp.permission.name,
  );

  return permissionNames;
};

/**
 * Get permission by name
 * @param {string} name
 * @returns {Promise<Permission>}
 */

/**
 * Get all permissions
 * @param {Object} filter - Optional filters
 * @param {Object} options - Query options
 * @returns {Promise<{permissions: Permission[], count: number}>}
 */
const getAllPermissions = async (filter = {}, options = {}) => {
  const { sortBy, sortOrder, includeRoles } = options;

  const permissions = await prisma.permission.findMany({
    where: filter,
    orderBy: sortBy ? { [sortBy]: sortOrder || 'asc' } : { createdAt: 'desc' },
    include: {
      roles: includeRoles || false,
    },
  });

  return {
    permissions,
    count: permissions.length,
  };
};

/**
 * Update permission by ID
 * @param {string} id
 * @param {Object} updateBody
 * @returns {Promise<Permission>}
 */
const updatePermission = async (id, updateBody) => {
  const existingPermission = await getPermissionById(id);

  // Check if new name conflicts with existing permissions
  if (updateBody.name && updateBody.name !== existingPermission.name) {
    const nameExists = await prisma.permission.findUnique({
      where: { name: updateBody.name },
    });

    if (nameExists) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Permission name already exists',
      );
    }
  }

  const updatedPermission = await prisma.permission.update({
    where: { id },
    data: updateBody,
  });

  return updatedPermission;
};

/**
 * Delete permission by ID
 * @param {string} id
 * @returns {Promise<{message: string}>}
 */
const deletePermission = async (id) => {
  await getPermissionById(id);

  // First delete all role-permission relations
  await prisma.rolePermission.deleteMany({
    where: { permissionId: id },
  });

  // Then delete the permission
  await prisma.permission.delete({
    where: { id },
  });

  return { message: 'Permission deleted successfully' };
};

module.exports = {
  createPermission,
  getPermissionById,
  getPermissionByName,
  getAllPermissions,
  updatePermission,
  deletePermission,
  getPermissionsByRoleName,
};
