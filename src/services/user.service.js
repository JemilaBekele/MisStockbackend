const httpStatus = require('http-status');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const EventEmitter = require('../utils/EventEmitter');
const bcrypt = require('bcryptjs');

const createUser = async (userBody) => {
  // Check if email exists
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email is already taken');
  }
  const user = await User.create(userBody);
  // Send Email
  EventEmitter.emit('signup', user);
  return user;
};

const getUserByEmail = async (email) => {
  const user = await User.findOne({ email });
  return user;
};

const getUserById = async (id) => {
  const user = await User.findById(id);
  return user;
};

// Update user details (except password)
const updateUser = async (id, updateBody) => {
  const user = await getUserById(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // If email is being updated, check if it's already taken
  if (updateBody.email && updateBody.email !== user.email) {
    if (await User.isEmailTaken(updateBody.email)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email is already taken');
    }
  }

  // Update user details
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

// Change user password
const changePassword = async (id, oldPassword, newPassword) => {
  const user = await getUserById(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Verify old password
  const isMatch = await user.isPasswordMatch(oldPassword);
  if (!isMatch) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Old password is incorrect');
  }

  // Update password with bcrypt hash
  user.password = await bcrypt.hash(newPassword, 8);
  await user.save();
  return user;
};

// Delete user
const deleteUser = async (id) => {
  const user = await getUserById(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return { message: 'User deleted successfully' };
};

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  updateUser,
  changePassword,
  deleteUser,
};
