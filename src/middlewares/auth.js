const httpStatus = require('http-status');
const passport = require('passport');
const ApiError = require('../utils/ApiError');

const verifyCallBack = (req, resolve, reject) => async (err, user, info) => {
  console.log('🔐 Auth Middleware - verifyCallBack called');
  console.log('🔐 Error:', err);
  console.log('🔐 Info:', info);
  console.log(
    '🔐 User:',
    user ? `User ID: ${user.id}, Email: ${user.email}` : 'No user',
  );

  if (err || info || !user) {
    console.log('❌ Authentication failed - rejecting request');
    console.log('❌ Reason:', {
      error: err?.message,
      info: info?.message,
      userPresent: !!user,
    });
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'please authenticate'));
  }

  console.log('✅ Authentication successful - user found');
  req.user = user;
  resolve();
};

const auth = async (req, res, next) => {
  console.log('🔐 Auth Middleware - Starting authentication');
  console.log('🔐 Request Headers:', {
    authorization: req.headers.authorization ? 'Present' : 'Missing',
    'content-type': req.headers['content-type'],
    'user-agent': req.headers['user-agent'],
  });
  console.log('🔐 Request Method:', req.method);
  console.log('🔐 Request URL:', req.originalUrl);

  return new Promise((resolve, reject) => {
    passport.authenticate(
      'jwt',
      { session: false },
      verifyCallBack(req, resolve, reject),
    )(req, res, next);
  })
    .then(() => {
      console.log('✅ Auth Promise resolved - calling next()');
      next();
    })
    .catch((error) => {
      console.log('❌ Auth Promise rejected - error:', error.message);
      next(error);
    });
};

module.exports = auth;
