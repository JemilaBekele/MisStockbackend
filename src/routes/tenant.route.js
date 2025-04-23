const express = require('express');
const router = express.Router();
const validate = require('../middlewares/validate');
const { tenantValidaation } = require('../validations');
const { tenantController } = require('../controllers');
const { authLimiter } = require('../middlewares/authLimiter');
const auth = require('../middlewares/auth');

// Authentication routes
router.post(
  '/api/register',
  validate(tenantValidaation.createTenantSchema),
  tenantController.createTenant
);

router.post(
  '/api/login',
  authLimiter,
  validate(tenantValidaation.loginSchema),
  tenantController.login
);

router.post(
  '/api/refresh-token',
  validate(tenantValidaation.refreshTokenSchema),
  tenantController.refreshToken
);

// Tenant management routes
router.put(
  '/api/tenant/:tenantId',
  auth,
  validate(tenantValidaation.updateTenantSchema), 
  tenantController.updateTenant
);

router.put(
  '/api/tenant/:tenantId/change-password',
  auth,
  validate(tenantValidaation.changePasswordSchema),
  tenantController.changePassword
);

router.delete(
  '/api/tenant/:tenantId',
  auth,
  tenantController.deleteTenant
);

module.exports = router;
