const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { cartService } = require('../services');
const ApiError = require('../utils/ApiError');

// Get Cart by ID
const getCart = catchAsync(async (req, res) => {
  const cart = await cartService.getCartById(req.params.id);
  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart not found');
  }
  res.status(httpStatus.OK).send({
    success: true,
    cart,
  });
});

// Get Cart by ID with user-based filtering
const getCartByUser = catchAsync(async (req, res) => {
  const cart = await cartService.getCartByIdByUser(req.params.id, req.user.id);
  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart not found');
  }
  res.status(httpStatus.OK).send({
    success: true,
    cart,
  });
});

// Get Cart by User ID
const getCartByUserId = catchAsync(async (req, res) => {
  const cart = await cartService.getCartByUserId(req.user.id);
  res.status(httpStatus.OK).send({
    success: true,
    cart,
  });
});

// Get all Carts
const getCarts = catchAsync(async (req, res) => {
  const { startDate, endDate, isCheckedOut } = req.query;

  const result = await cartService.getAllCarts({
    startDate,
    endDate,
    isCheckedOut:
      isCheckedOut !== undefined ? isCheckedOut === 'true' : undefined,
  });

  res.status(httpStatus.OK).send({
    success: true,
    ...result,
  });
});

// Create or Update Cart
const createOrUpdateCart = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const cart = await cartService.createOrUpdateCart(req.body, userId);
  res.status(httpStatus.OK).send({
    success: true,
    message: 'Cart updated successfully',
    cart,
  });
});

// Add item to cart
const addItemToCart = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const cartItem = await cartService.addItemToCart(
    req.params.cartId,
    req.body,
    userId,
  );
  res.status(httpStatus.CREATED).send({
    success: true,
    message: 'Item added to cart successfully',
    cartItem,
  });
});

// Update cart item
const updateCartItem = catchAsync(async (req, res) => {
  const cartItem = await cartService.updateCartItem(
    req.params.cartItemId,
    req.body,
  );
  res.status(httpStatus.OK).send({
    success: true,
    message: 'Cart item updated successfully',
    cartItem,
  });
});

// Remove item from cart
const removeItemFromCart = catchAsync(async (req, res) => {
  const result = await cartService.removeItemFromCart(req.params.cartItemId);
  res.status(httpStatus.OK).send({
    success: true,
    message: result.message,
  });
});

// Checkout cart (convert to sell)
const checkoutCart = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const result = await cartService.checkoutCart(
    req.params.cartId,
    req.body,
    userId,
  );
  res.status(httpStatus.OK).send({
    success: true,
    message: result.message,
    cart: result.cart,
    sell: result.sell,
  });
});

// Clear cart (remove all items)
const clearCart = catchAsync(async (req, res) => {
  const result = await cartService.clearCart(req.params.cartId, req.user.id);
  res.status(httpStatus.OK).send({
    success: true,
    message: result.message,
  });
});

// Delete cart
const deleteCart = catchAsync(async (req, res) => {
  const result = await cartService.deleteCart(req.params.cartId);
  res.status(httpStatus.OK).send({
    success: true,
    message: result.message,
  });
});

// ========== WAITLIST MANAGEMENT CONTROLLERS ==========

// Add item to waitlist
const addToWaitlist = catchAsync(async (req, res) => {
  const userId = req.user.id;
console.log('Request Body:', req.body); // Debug log
  const waitlist = await cartService.addToWaitlist(req.body, userId);

  res.status(httpStatus.CREATED).send({
    success: true,
    message: 'Item added to waitlist successfully',
    waitlist,
  });
});
//
const removeItemFromWaitlist = catchAsync(async (req, res) => {
  const result = await cartService.removeItemFromWaitlist(
    req.params.waitlistItemId,
  );
  res.status(httpStatus.OK).send({
    success: true,
    message: result.message,
  });
});

// Clear entire waitlist
const clearWaitlist = catchAsync(async (req, res) => {
  const result = await cartService.clearWaitlist(req.params.cartId);
  res.status(httpStatus.OK).send({
    success: true,
    message: result.message,
  });
});

// Get waitlists by current user
const getMyWaitlists = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { startDate, endDate } = req.query;

  const filters = { startDate, endDate };

  const waitlists = await cartService.getWaitlistsByUser(userId, filters);

  res.status(httpStatus.OK).send({
    success: true,
    waitlists,
    count: waitlists.length,
  });
});

// Get all waitlists (admin function)
const getAllWaitlists = catchAsync(async (req, res) => {
  const { userId, startDate, endDate } = req.query;

  const filters = {
    userId,
    startDate,
    endDate,
  };

  const waitlists = await cartService.getAllWaitlists(filters);

  res.status(httpStatus.OK).send({
    success: true,
    waitlists,
    count: waitlists.length,
  });
});

// Get waitlist by ID
const getWaitlist = catchAsync(async (req, res) => {
  const { waitlistId } = req.params;

  // Since we don't have a direct getWaitlistById function, we'll use getAllWaitlists with ID filter
  const waitlists = await cartService.getAllWaitlists({});
  const waitlist = waitlists.find((w) => w.id === waitlistId);

  if (!waitlist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Waitlist not found');
  }

  res.status(httpStatus.OK).send({
    success: true,
    waitlist,
  });
});

// Convert waitlist to cart item
const convertWaitlistToCart = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { waitlistId } = req.params;

  const result = await cartService.convertWaitlistToCartItem(
    waitlistId,
    userId,
  );

  res.status(httpStatus.OK).send({
    success: true,
    message: result.message,
    cartItem: result.cartItem,
    cart: result.cart,
  });
});

// Get waitlists for a specific cart
const getCartWaitlists = catchAsync(async (req, res) => {
  const { cartId } = req.params;

  // Get the cart with waitlists included
  const cart = await cartService.getCartById(cartId);

  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart not found');
  }

  res.status(httpStatus.OK).send({
    success: true,
    waitlists: cart.waitlists || [],
    count: cart.waitlists?.length || 0,
  });
});

// Remove old waitlist functions that don't exist in the service anymore
// (getWaitlistCarts, removeFromWaitlist with cartId - these were from the old implementation)

module.exports = {
  getCart,
  getCartByUser,
  getCartByUserId,
  getCarts,
  createOrUpdateCart,
  addItemToCart,
  updateCartItem,
  removeItemFromCart,
  checkoutCart,
  clearCart,
  deleteCart,

  // Waitlist controllers
  addToWaitlist,
  removeItemFromWaitlist,
  clearWaitlist,
  getMyWaitlists,
  getAllWaitlists,
  getWaitlist,
  convertWaitlistToCart,
  getCartWaitlists,
};
