// config/multer.config.js
const multer = require('multer');
const httpStatus = require('http-status');
const ApiError = require('./ApiError');

const uploadImage = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    // Only process these specific fields as files
    if (['image'].includes(file.fieldname)) {
      if (!file.mimetype.startsWith('image/')) {
        return cb(
          new ApiError(httpStatus.BAD_REQUEST, 'Only images allowed'),
          false,
        );
      }
      return cb(null, true);
    }
    // Explicitly ignore all other fields
    return cb(null, false);
  },
  limits: { fileSize: 40 * 1024 * 1024 }, // 🔺 40MB limit
}).any();
const uploadImacamp = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    // Only process these specific fields as files
    if (['logo'].includes(file.fieldname)) {
      if (!file.mimetype.startsWith('image/')) {
        return cb(
          new ApiError(httpStatus.BAD_REQUEST, 'Only images allowed'),
          false,
        );
      }
      return cb(null, true);
    }
    // Explicitly ignore all other fields
    return cb(null, false);
  },
  limits: { fileSize: 40 * 1024 * 1024 }, // 🔺 40MB limit
}).any();
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    // Only process these specific fields as files
    if (['photo', 'national'].includes(file.fieldname)) {
      if (!file.mimetype.startsWith('image/')) {
        return cb(
          new ApiError(httpStatus.BAD_REQUEST, 'Only images allowed'),
          false,
        );
      }
      return cb(null, true);
    }
    // Explicitly ignore all other fields
    return cb(null, false);
  },
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
}).any();

module.exports = { upload, uploadImage, uploadImacamp };
