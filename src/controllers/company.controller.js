/* eslint-disable no-restricted-syntax */
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { companyService } = require('../services');
const ApiError = require('../utils/ApiError');

// Create Company
const createCompany = catchAsync(async (req, res) => {
  // Structure files by field name
  const structuredFiles = {};

  if (Array.isArray(req.files)) {
    req.files.forEach((file) => {
      if (!structuredFiles[file.fieldname]) {
        structuredFiles[file.fieldname] = [];
      }
      structuredFiles[file.fieldname].push(file);
    });
  } else if (req.files) {
    for (const [fieldname, files] of Object.entries(req.files)) {
      structuredFiles[fieldname] = Array.isArray(files) ? files : [files];
    }
  }

  // Ensure logo field exists even if no file was uploaded
  structuredFiles.logo = structuredFiles.logo || undefined;

  const company = await companyService.createCompany(req.body, structuredFiles);

  res.status(httpStatus.CREATED).send({
    success: true,
    message: 'Company created successfully',
    company,
  });
});
// Update Company
const updateCompany = catchAsync(async (req, res) => {
  // Structure files (same as create controller)
  const structuredFiles = {};
  if (Array.isArray(req.files)) {
    req.files.forEach((file) => {
      if (!structuredFiles[file.fieldname]) {
        structuredFiles[file.fieldname] = [];
      }
      structuredFiles[file.fieldname].push(file);
    });
  } else if (req.files) {
    for (const [fieldname, files] of Object.entries(req.files)) {
      structuredFiles[fieldname] = Array.isArray(files) ? files : [files];
    }
  }
  structuredFiles.logo = structuredFiles.logo || undefined;

  const company = await companyService.updateCompany(
    req.params.id,
    req.body,
    structuredFiles,
  );

  res.send({
    success: true,
    message: 'Company updated successfully',
    company,
  });
});
// Get Company by ID
const getCompany = catchAsync(async (req, res) => {
  const company = await companyService.getCompanyById(req.params.id);
  if (!company) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Company not found');
  }
  res.status(httpStatus.OK).send(company);
});

// Get all Companies
const getCompanies = catchAsync(async (req, res) => {
  const result = await companyService.getAllCompanies();
  res.status(httpStatus.OK).json(result);
});

const deleteCompany = catchAsync(async (req, res) => {
  const response = await companyService.deleteCompany(req.params.id);
  res.status(httpStatus.OK).send(response);
});
// services/notificationService.js

// In your controller
const getNotifications = async (req, res) => {
  const { unreadOnly, type, shopId, storeId } = req.query;
  const userId = req.user.id;

  const result = await companyService.getNotifications(userId, {
    unreadOnly: unreadOnly === 'true',
    type,
    shopId,
    storeId,
  });

  res.status(httpStatus.OK).json(result);
};

const markNotificationAsRead = async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user.id;

  const notification = await companyService.markAsRead(notificationId, userId);

  res.status(httpStatus.OK).json(notification);
};

module.exports = {
  createCompany,
  getCompany,
  getCompanies,
  updateCompany,
  deleteCompany,
  getNotifications,
  markNotificationAsRead,
};
