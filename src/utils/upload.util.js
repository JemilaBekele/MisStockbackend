// utils/upload.util.js
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const httpStatus = require('http-status');
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const ApiError = require('./ApiError');
const logger = require('../config/logger');
const config = require('../config/config');

const uploadImage = async (file, subfolder = '') => {
  try {
    const dirPath = path.join(__dirname, '../../uploads', subfolder);
    await fs.mkdir(dirPath, { recursive: true });

    const filename = `image-${Date.now()}.webp`;
    const outputPath = path.join(dirPath, filename);

    await sharp(file.buffer)
      .resize(600)
      .webp({ quality: 80 })
      .toFile(outputPath);

    // Include 'uploads' in the path
    const relativePath = path.join('uploads', subfolder, filename);
    return relativePath;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Image processing failed',
    );
  }
};

const deleteImage = async (filePath) => {
  if (!filePath) return;

  try {
    // Handle AWS S3 storage
    if (config.storage.provider === 's3') {
      const s3 = new S3Client({
        region: config.storage.s3.region,
        credentials: {
          accessKeyId: config.storage.s3.accessKeyId,
          secretAccessKey: config.storage.s3.secretAccessKey,
        },
      });

      // Extract key from S3 URL (or use full path if already a key)
      const url = new URL(filePath);
      const key = url.pathname.substring(1); // Remove leading slash

      await s3.send(
        new DeleteObjectCommand({
          Bucket: config.storage.s3.bucket,
          Key: key,
        }),
      );
    }
    // Handle local storage
    else {
      const fullPath = path.join(__dirname, '../uploads', filePath);
      await fs.unlink(fullPath);
    }

    logger.info(`Deleted image: ${filePath}`);
  } catch (error) {
    logger.error(`Failed to delete image ${filePath}:`, error);
    // Don't throw error - fail silently to avoid blocking user updates
  }
};
module.exports = { uploadImage, deleteImage };
