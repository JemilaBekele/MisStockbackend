const express = require('express');

const router = express.Router();
const validate = require('../middlewares/validate');
const { userValidation, authValidation } = require('../validations');
const { authController } = require('../controllers');
const { authLimiter } = require('../middlewares/authLimiter');
const auth = require('../middlewares/auth');

// Authentication routes
router.post(
  '/auth/register',
  validate(userValidation.createUserSchema),
  authController.register,
);

router.post(
  '/auth/login',
  authLimiter,
  validate(authValidation.loginSchema),
  authController.login,
);

router.post(
  '/auth/refresh-token',
  validate(authValidation.refreshTokenSchema),
  authController.refreshToken,
);

// User management routes
router.put(
  '/api/user/:userId',auth, 

  validate(userValidation.updateUserSchema), // Assuming validation for update is defined
  authController.updateUser,
);

router.put(
  '/api/user/:userId/change-password',auth,
  validate(userValidation.changePasswordSchema), // Assuming validation for password change is defined
  authController.changePassword,
);

router.delete(
  '/api/user/:userId',auth,
  authController.deleteUser,
);

module.exports = router;
