// permission.middleware.js
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const prisma = require('../services/prisma');

const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const { user } = req;

      // 1. Check if user exists
      if (!user) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required');
      }

      // 2. Get full user with role and permissions from database
      const userWithPermissions = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      // 3. Check if user has role and permissions
      if (!userWithPermissions?.role?.permissions) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          'Access denied - no permissions assigned',
        );
      }

      // 4. Check for required permission
      const hasPermission = userWithPermissions.role.permissions.some(
        (rp) => rp.permission.name === requiredPermission,
      );

      if (!hasPermission) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          `Insufficient permissions. Required: ${requiredPermission}`,
        );
      }

      // Attach full user object to request for downstream use
      req.user = userWithPermissions;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = checkPermission;
