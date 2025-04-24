const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { userService, tokenService, authService } = require('../services');
const ApiError = require('../utils/ApiError');

const register = catchAsync(async (req, res) => {
  // create a user
  const user = await userService.createUser(req.body);
  // generate token
  const tokens = await tokenService.generateAuthTokens(user.id);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.login(
    email,
    password,
    req.connection.remoteAddress,
  );
  // generate token
  const tokens = await tokenService.generateAuthTokens(user.id);
  res.status(httpStatus.OK).send({ user, tokens });
});

const refreshToken = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuthToken(req.body.refreshToken);
  res.status(httpStatus.OK).send({ ...tokens });
});

// Update user details
const updateUser = catchAsync(async (req, res) => {
  const { userId } = req.params; // assuming userId is passed in the URL params
  const updatedUser = await userService.updateUser(userId, req.body);
  res.status(httpStatus.OK).send({ user: updatedUser });
});

// Change user password
const changePassword = catchAsync(async (req, res) => {
  const { userId } = req.params; // assuming userId is passed in the URL params
  const { oldPassword, newPassword } = req.body;
  const updatedUser = await userService.changePassword(
    userId,
    oldPassword,
    newPassword,
  );
  res.status(httpStatus.OK).send({ user: updatedUser });
});

const getAllUsers = catchAsync(async (req, res) => {
  const result = await userService.getAllUsers();
  res.status(httpStatus.OK).send(result); // returns { users, count }
});
// Delete user
const deleteUser = catchAsync(async (req, res) => {
  const { userId } = req.params; // assuming userId is passed in the URL params
  const response = await userService.deleteUser(userId);
  res.status(httpStatus.OK).send(response); // response could be { message: 'User deleted successfully' }
});
const getUserById = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const user = await userService.getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.status(httpStatus.OK).send({ user });
});
module.exports = {
  register,
  login,
  refreshToken,
  updateUser,
  changePassword,
  deleteUser,
  getAllUsers,
  getUserById,
};
