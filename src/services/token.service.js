// src/services/token.service.js

const jwt = require('jsonwebtoken');
const dayjs = require('dayjs');
const config = require('../config/config');
const { tokenTypes } = require('../config/tokens'); // Assuming tokenTypes maps to strings like 'ACCESS', 'REFRESH'
// No need to import prisma here anymore

/**
 * Generate token
 * @param {number} userId - Assuming user ID is a number
 * @param {dayjs.Dayjs} expires
 * @param {string} type - Token type (e.g., tokenTypes.ACCESS)
 * @param {string} [secret] - JWT secret key
 * @returns {string}
 */
const generateToken = (userId, expires, type, secret = config.jwt.secret) => {
  const payload = {
    sub: userId, // 'sub' is a standard claim for subject (user ID)
    iat: dayjs().unix(), // 'iat' issued at time
    exp: expires.unix(), // 'exp' expiration time
    type, // Include the type in the payload
  };
  return jwt.sign(payload, secret);
};

// REMOVED saveToken function - tokens are no longer stored in DB

/**
 * Verify token and return token payload (or throw an error if it is not valid)
 * Validation is based purely on JWT signature and expiration date ('exp' claim).
 * @param {string} token
 * @param {string} type - Expected token type
 * @returns {Promise<Object>} // Returns the JWT payload if valid
 */
const verifyToken = async (token, type) => {
  try {
    const payload = jwt.verify(token, config.jwt.secret);

    // Optional: Check if the type in the payload matches the expected type
    if (payload.type !== type) {
      throw new Error('Invalid token type');
    }

    // JWT.verify already checks the 'exp' claim, so we don't need a manual check here.
    // We also don't need to look up the token in the database.

    return payload; // Return the decoded payload
  } catch (error) {
    // jwt.verify will throw an error if the token is invalid or expired
    throw new Error(`Token verification failed: ${error.message}`);
  }
};

/**
 * Generate auth tokens (access and refresh)
 * Tokens are NOT saved in the database.
 * @param {number} userId - Assuming user ID is a number
 * @returns {Promise<Object>}
 */
const generateAuthTokens = async (userId) => {
  const accessTokenExpires = dayjs().add(
    config.jwt.accessExpirationMinutes,
    'minutes',
  );
  const accessToken = generateToken(
    userId,
    accessTokenExpires,
    tokenTypes.ACCESS,
  );

  const refreshTokenExpires = dayjs().add(
    config.jwt.refreshExpirationDays,
    'days',
  );
  const refreshToken = generateToken(
    userId,
    refreshTokenExpires,
    tokenTypes.REFRESH,
  );

  // REMOVED the call to saveToken - refresh tokens are not saved in DB

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

module.exports = {
  generateToken,
  generateAuthTokens,
  verifyToken,
  // REMOVED saveToken from export
};
