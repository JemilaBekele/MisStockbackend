const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const prisma = require('./prisma');
const sellService = require('./Sell.service');

// Get Cart by ID
const getCartById = async (id) => {
  const cart = await prisma.addToCart.findUnique({
    where: { id },
    include: {
      user: true,
      branch: true,
      customer: true,
      createdBy: true,
      updatedBy: true,
      items: {
        include: {
          shop: true,
          product: {
            include: {
              unitOfMeasure: true,
              category: true,
            },
          },
          unitOfMeasure: true,
        },
      },
      waitlists: {
        include: {
          user: true,
          customer: true,
          branch: true,
          cartItem: {
            include: {
              product: true,
              unitOfMeasure: true,
            },
          },
          product: true,
          createdBy: true,
          updatedBy: true,
        },
      },
    },
  });
  return cart;
};

// Get Cart by User ID
const getCartByUserId = async (userId) => {
  const cart = await prisma.addToCart.findFirst({
    where: {
      userId,
      isCheckedOut: false,
    },
    include: {
      user: true,
      branch: true,
      customer: true,
      createdBy: true,
      updatedBy: true,
      items: {
        include: {
          shop: true,
          product: {
            include: {
              unitOfMeasure: true,
              category: true,
            },
          },
          unitOfMeasure: true,
        },
      },
      waitlists: {
        include: {
          user: true,
          customer: true,
          branch: true,
          cartItem: {
            include: {
              product: true,
              unitOfMeasure: true,
            },
          },
          product: true,
          createdBy: true,
          updatedBy: true,
        },
      },
    },
  });
  return cart;
};

// Get Cart by ID with user-based filtering
const getCartByIdByUser = async (id, userId = null) => {
  // Get the cart with all items first
  const cart = await prisma.addToCart.findUnique({
    where: { id },
    include: {
      user: true,
      branch: true,
      customer: true,
      createdBy: true,
      updatedBy: true,
      items: {
        include: {
          shop: true,
          product: {
            include: {
              unitOfMeasure: true,
              category: true,
            },
          },
          unitOfMeasure: true,
        },
      },
      waitlists: {
        include: {
          user: true,
          customer: true,
          branch: true,
          cartItem: {
            include: {
              product: true,
              unitOfMeasure: true,
            },
          },
          product: true,
          createdBy: true,
          updatedBy: true,
        },
      },
    },
  });

  if (!cart) return null;

  // If userId is provided, filter items and return both versions
  if (userId) {
    const userWithShops = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        shops: {
          select: { id: true },
        },
      },
    });

    const userShopIds = userWithShops?.shops?.map((shop) => shop.id) || [];

    const filteredItems = cart.items.filter((item) =>
      userShopIds.includes(item.shopId),
    );

    return {
      ...cart,
      items: filteredItems,
      // Include metadata about the filtering
      _metadata: {
        totalItems: cart.items.length,
        accessibleItems: filteredItems.length,
        hasRestrictedAccess: filteredItems.length < cart.items.length,
      },
    };
  }

  return cart;
};

// Get all Carts
const getAllCarts = async ({ startDate, endDate, isCheckedOut } = {}) => {
  const whereClause = {};

  // Add checkout status filter
  if (isCheckedOut !== undefined) {
    whereClause.isCheckedOut = isCheckedOut;
  }

  // Convert string dates to Date objects if they exist
  const startDateObj = startDate ? new Date(startDate) : undefined;
  const endDateObj = endDate ? new Date(endDate) : undefined;

  // Build the date filter
  if (startDateObj && endDateObj) {
    whereClause.createdAt = {
      gte: startDateObj,
      lte: endDateObj,
    };
  } else if (startDateObj) {
    whereClause.createdAt = {
      gte: startDateObj,
      lte: new Date(),
    };
  } else if (endDateObj) {
    whereClause.createdAt = {
      lte: endDateObj,
    };
  }

  const carts = await prisma.addToCart.findMany({
    where: whereClause,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: true,
      branch: true,
      customer: true,
      items: {
        include: {
          shop: true,
          product: true,
          unitOfMeasure: true,
        },
      },
      waitlists: {
        include: {
          user: true,
          customer: true,
          product: true,
        },
      },
      _count: {
        select: {
          items: true,
          waitlists: true,
        },
      },
    },
  });

  return {
    carts,
    count: carts.length,
  };
};

// Create or Update Cart
const createOrUpdateCart = async (cartBody, userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { branch: true },
  });
  // console.log(cartBody);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Parse items if it's a string
  const { items: itemsString, ...restCartBody } = cartBody;
  const items =
    typeof itemsString === 'string' ? JSON.parse(itemsString) : itemsString;

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Cart must have at least one item',
    );
  }

  // Check if user already has an active cart
  const existingCart = await prisma.addToCart.findFirst({
    where: {
      userId,
      isCheckedOut: false,
    },
    include: {
      items: true,
      waitlists: true,
    },
  });

  // Validate items and calculate totals
  const products = await prisma.product.findMany({
    where: { id: { in: items.map((item) => item.productId) } },
    include: { unitOfMeasure: true },
  });

  let totalItems = 0;
  let totalAmount = 0;

  const enhancedItems = items.map((item, index) => {
    if (!item.productId) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Item ${index + 1} is missing productId`,
      );
    }

    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Item ${index + 1} has invalid productId`,
      );
    }

    if (item.quantity <= 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Item ${index + 1} has invalid quantity`,
      );
    }

    // Determine unit price
    let unitPrice = Number(item.unitPrice) || 0;
    if (unitPrice === 0) {
      unitPrice = product.sellPrice ? Number(product.sellPrice) : 0;
    }

    if (
      typeof unitPrice !== 'number' ||
      Number.isNaN(unitPrice) ||
      unitPrice < 0
    ) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Item ${index + 1} has invalid unit price`,
      );
    }

    // Validate shopId
    const { shopId } = item;
    if (!shopId) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Item ${index + 1} is missing shopId`,
      );
    }

    const quantity = Number(item.quantity);
    const itemTotalPrice = unitPrice * quantity;

    totalItems += quantity;
    totalAmount += itemTotalPrice;

    return {
      ...item,
      shopId,
      unitPrice,
      quantity,
      totalPrice: itemTotalPrice,
      unitOfMeasureId: item.unitOfMeasureId || product.unitOfMeasureId,
    };
  });

  if (existingCart) {
    // Update existing cart
    return prisma.$transaction(async (tx) => {
      // Delete all existing items
      await tx.cartItem.deleteMany({
        where: { cartId: existingCart.id },
      });

      // Update cart with new items
      const updatedCart = await tx.addToCart.update({
        where: { id: existingCart.id },
        data: {
          totalItems,
          totalAmount,
          branchId: restCartBody.branchId || user.branchId,
          customerId: restCartBody.customerId,
          updatedById: userId,
          items: {
            create: enhancedItems.map((item) => ({
              shopId: item.shopId,
              productId: item.productId,
              unitOfMeasureId: item.unitOfMeasureId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              notes: item.notes,
            })),
          },
        },
        include: {
          user: true,
          branch: true,
          customer: true,
          createdBy: true,
          updatedBy: true,
          items: {
            include: {
              shop: true,
              product: {
                include: {
                  unitOfMeasure: true,
                  category: true,
                },
              },
              unitOfMeasure: true,
            },
          },
          waitlists: true,
        },
      });

      return updatedCart;
    });
  }

  // Create new cart
  const newCart = await prisma.addToCart.create({
    data: {
      userId,
      branchId: restCartBody.branchId || user.branchId,
      customerId: restCartBody.customerId,
      totalItems,
      totalAmount,
      isCheckedOut: false,
      createdById: userId,
      updatedById: userId,
      items: {
        create: enhancedItems.map((item) => ({
          shopId: item.shopId,
          productId: item.productId,
          unitOfMeasureId: item.unitOfMeasureId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          notes: item.notes,
        })),
      },
    },
    include: {
      user: true,
      branch: true,
      customer: true,
      createdBy: true,
      updatedBy: true,
      items: {
        include: {
          shop: true,
          product: {
            include: {
              unitOfMeasure: true,
              category: true,
            },
          },
          unitOfMeasure: true,
        },
      },
      waitlists: true,
    },
  });

  return newCart;
};

// Helper function to update cart totals
const updateCartTotals = async (cartId) => {
  const cartItems = await prisma.cartItem.findMany({
    where: { cartId },
  });

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

  await prisma.addToCart.update({
    where: { id: cartId },
    data: {
      totalItems,
      totalAmount,
    },
  });
};

// Add item to cart - creates new cart if cartId not provided or not found
const addItemToCart = async (cartId, itemData, userId) => {
  let cart;

  // If cartId is provided, try to find the cart
  if (cartId) {
    cart = await getCartById(cartId);
  }

  // If cart doesn't exist or cartId not provided, create a new cart
  if (!cart) {
    // Validate that userId is provided for creating new cart
    if (!userId) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'User ID is required to create a new cart',
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid user ID');
    }

    // Create new cart
    cart = await prisma.addToCart.create({
      data: {
        userId,
        isCheckedOut: false,
        totalItems: 0,
        totalAmount: 0,
        createdById: userId,
        updatedById: userId,
      },
      include: {
        items: true,
        waitlists: true,
      },
    });
  }

  // Check if cart is checked out
  if (cart.isCheckedOut) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Cannot add items to checked out cart',
    );
  }

  // Validate item data
  const { productId, shopId, quantity, unitPrice, unitOfMeasureId, notes } =
    itemData;

  if (!productId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Product ID is required');
  }

  if (!shopId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Shop ID is required');
  }

  if (quantity <= 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Quantity must be greater than 0',
    );
  }

  // Fetch product for validation
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { unitOfMeasure: true },
  });

  if (!product) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid product ID');
  }

  // Verify shop exists
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
  });

  if (!shop) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid shop ID');
  }

  // Determine final unit price
  let finalUnitPrice = Number(unitPrice) || 0;
  if (finalUnitPrice === 0) {
    finalUnitPrice = product.sellPrice ? Number(product.sellPrice) : 0;
  }

  const finalUnitOfMeasureId = unitOfMeasureId || product.unitOfMeasureId;

  const totalPrice = finalUnitPrice * quantity;

  // Check if item already exists in cart (same product, shop, and unit of measure)
  const existingCartItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
      shopId,
      unitOfMeasureId: finalUnitOfMeasureId,
    },
  });

  let cartItem;

  if (existingCartItem) {
    // Update existing item quantity and price
    cartItem = await prisma.cartItem.update({
      where: { id: existingCartItem.id },
      data: {
        quantity: existingCartItem.quantity + quantity,
        unitPrice: finalUnitPrice,
        totalPrice: existingCartItem.totalPrice + totalPrice,
        notes: notes || existingCartItem.notes,
      },
      include: {
        shop: true,
        product: {
          include: {
            unitOfMeasure: true,
            category: true,
          },
        },
        unitOfMeasure: true,
      },
    });
  } else {
    // Create new cart item
    cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        shopId,
        productId,
        unitOfMeasureId: finalUnitOfMeasureId,
        quantity,
        unitPrice: finalUnitPrice,
        totalPrice,
        notes,
      },
      include: {
        shop: true,
        product: {
          include: {
            unitOfMeasure: true,
            category: true,
          },
        },
        unitOfMeasure: true,
      },
    });
  }

  // Update cart totals
  await updateCartTotals(cart.id);

  return {
    cart: {
      id: cart.id,
      userId: cart.userId,
      isCheckedOut: cart.isCheckedOut,
      totalItems: cart.totalItems,
      totalAmount: cart.totalAmount,
    },
    cartItem,
  };
};

// Update cart item
const updateCartItem = async (cartItemId, updateData) => {
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: {
      cart: true,
    },
  });

  if (!cartItem) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart item not found');
  }

  if (cartItem.cart.isCheckedOut) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Cannot update items in checked out cart',
    );
  }

  const { quantity, unitPrice, notes } = updateData;

  if (quantity !== undefined && quantity <= 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Quantity must be greater than 0',
    );
  }

  const finalQuantity = quantity !== undefined ? quantity : cartItem.quantity;
  const finalUnitPrice =
    unitPrice !== undefined ? Number(unitPrice) : cartItem.unitPrice;
  const totalPrice = finalQuantity * finalUnitPrice;

  const updatedCartItem = await prisma.cartItem.update({
    where: { id: cartItemId },
    data: {
      quantity: finalQuantity,
      unitPrice: finalUnitPrice,
      totalPrice,
      notes: notes !== undefined ? notes : cartItem.notes,
    },
    include: {
      shop: true,
      product: {
        include: {
          unitOfMeasure: true,
          category: true,
        },
      },
      unitOfMeasure: true,
    },
  });

  // Update cart totals
  await updateCartTotals(cartItem.cartId);

  return updatedCartItem;
};

// Remove item from cart
const removeItemFromCart = async (cartItemId) => {
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: {
      cart: true,
    },
  });

  if (!cartItem) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart item not found');
  }

  if (cartItem.cart.isCheckedOut) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Cannot remove items from checked out cart',
    );
  }

  await prisma.cartItem.delete({
    where: { id: cartItemId },
  });

  // Update cart totals
  await updateCartTotals(cartItem.cartId);

  return { message: 'Item removed from cart successfully' };
};
const assignCustomerToCart = async (cartId, customerId) => {
  console.log('=== ASSIGN CUSTOMER TO CART START ===');
  console.log('Inputs:', { cartId, customerId });
  console.log('---------------------------');

  try {
    // Validate customer exists
    console.log('1. Validating customer exists...');
    console.log('   Customer ID:', customerId);
    
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    console.log('   Customer found:', customer ? {
      id: customer.id,
      name: customer.name,
      phone1: customer.phone1
    } : 'NULL');

    if (!customer) {
      console.error('ERROR: Customer not found');
      throw new ApiError(httpStatus.NOT_FOUND, 'Customer not found');
    }
    console.log('✓ Customer validation passed');

    // Validate cart exists
    console.log('\n2. Validating cart exists...');
    console.log('   Cart ID:', cartId);
    
    const cart = await prisma.addToCart.findUnique({
      where: { id: cartId },
    });

    console.log('   Cart found:', cart ? {
      id: cart.id,
      userId: cart.userId,
      customerId: cart.customerId,
      isCheckedOut: cart.isCheckedOut,
      totalItems: cart.totalItems
    } : 'NULL');

    if (!cart) {
      console.error('ERROR: Cart not found');
      throw new ApiError(httpStatus.NOT_FOUND, 'Cart not found');
    }
    console.log('✓ Cart validation passed');

    // Check if cart is already checked out
    console.log('\n3. Checking cart checkout status...');
    console.log('   Cart isCheckedOut:', cart.isCheckedOut);
    
    if (cart.isCheckedOut) {
      console.error('ERROR: Cart is already checked out');
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Cannot assign customer to checked out cart',
      );
    }
    console.log('✓ Cart is not checked out');

    // Check if cart already has this customer
    console.log('\n4. Checking existing customer assignment...');
    console.log('   Current cart customerId:', cart.customerId);
    console.log('   New customerId:', customerId);
    
    if (cart.customerId === customerId) {
      console.log('⚠️ Cart already assigned to this customer');
      console.log('=== ASSIGN CUSTOMER TO CART COMPLETE (no change needed) ===');
      return cart; // Return existing cart without update
    }

    // Update cart with customer
    console.log('\n5. Updating cart with customer...');
    const updatedCart = await prisma.addToCart.update({
      where: { id: cartId },
      data: {
        customerId,
      },
    });

    console.log('✅ Cart updated successfully');
    console.log('   Updated cart:', {
      id: updatedCart.id,
      customerId: updatedCart.customerId,
      updatedAt: updatedCart.updatedAt
    });

    console.log('\n=== ASSIGN CUSTOMER TO CART COMPLETE ===');
    console.log('✅ Customer assigned to cart successfully');
    
    return updatedCart;
    
  } catch (error) {
    console.error('\n!!! ASSIGN CUSTOMER TO CART ERROR !!!');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Log specific error details
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.meta) {
      console.error('Error meta:', error.meta);
    }
    
    // Re-throw the error for the caller to handle
    throw error;
  }
};

// Clear cart (remove all items)
const clearCart = async (cartId, userId) => {
  const cart = await getCartById(cartId);
  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart not found');
  }

  if (cart.isCheckedOut) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot clear checked out cart');
  }

  await prisma.$transaction(async (tx) => {
    // Delete all cart items
    await tx.cartItem.deleteMany({
      where: { cartId },
    });

    // Reset cart totals
    await tx.addToCart.update({
      where: { id: cartId },
      data: {
        totalItems: 0,
        totalAmount: 0,
        updatedById: userId,
      },
    });
  });

  return { message: 'Cart cleared successfully' };
};
// Checkout cart (convert to sell)
const checkoutCart = async (cartId, checkoutData, userId) => {
  console.log('=== CHECKOUT CART START ===');
  console.log('Inputs:', { cartId, checkoutData, userId });
  console.log('---------------------------');

  try {
    // Get user with branch information
    console.log('1. Fetching user with ID:', userId);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { branch: true },
    });

    console.log(
      'User found:',
      user
        ? {
            id: user.id,
            email: user.email,
            branchId: user.branchId,
            branch: user.branch,
          }
        : 'NULL',
    );

    if (!user) {
      console.error('ERROR: User not found');
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    // Fetch cart with customer information
    console.log('\n2. Fetching cart with ID:', cartId);
    const cart = await prisma.addToCart.findUnique({
      where: { id: cartId },
      include: {
        customer: true,
        items: {
          include: {
            shop: true,
            product: {
              include: {
                category: true,
                unitOfMeasure: true,
              },
            },
            unitOfMeasure: true,
          },
        },
      },
    });

    console.log(
      'Cart found:',
      cart
        ? {
            id: cart.id,
            customerId: cart.customerId,
            isCheckedOut: cart.isCheckedOut,
            itemsCount: cart.items?.length || 0,
            hasCustomer: !!cart.customer,
          }
        : 'NULL',
    );

    if (!cart) {
      console.error('ERROR: Cart not found');
      throw new ApiError(httpStatus.NOT_FOUND, 'Cart not found');
    }

    // Validation checks
    console.log('\n3. Performing validations:');

    if (cart.isCheckedOut) {
      console.error('ERROR: Cart is already checked out');
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cart is already checked out');
    }
    console.log('✓ Cart not checked out - OK');

    if (cart.items.length === 0) {
      console.error('ERROR: Cart has no items');
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot checkout empty cart');
    }
    console.log(`✓ Cart has ${cart.items.length} items - OK`);

    if (!cart.customerId) {
      console.error('ERROR: Cart has no customerId');
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Cart must be associated with a customer to checkout',
      );
    }
    console.log(`✓ Cart has customerId: ${cart.customerId} - OK`);

    if (!cart.customer) {
      console.error('ERROR: Customer not found in cart');
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Associated customer not found',
      );
    }
    console.log(
      `✓ Customer found: ${cart.customer.name || cart.customer.id} - OK`,
    );

    // Prepare sell body
    console.log('\n4. Preparing sell body:');

    const sellBody = {
      ...checkoutData,
      branchId: user.branchId,
      customerId: cart.customerId,
      customer: cart.customer,
      items: cart.items.map((item, index) => {
        const itemData = {
          productId: item.productId,
          shopId: item.shopId,
          unitOfMeasureId: item.unitOfMeasureId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        };
        console.log(`  Item ${index + 1}:`, itemData);
        return {
          ...itemData,
          product: item.product,
          shop: item.shop,
        };
      }),
    };

    console.log('Sell body prepared:', {
      branchId: sellBody.branchId,
      customerId: sellBody.customerId,
      itemsCount: sellBody.items.length,
      checkoutDataKeys: Object.keys(checkoutData || {}),
    });

    // Create sell from cart items
    console.log('\n5. Creating sell via sellService.createSell()');
    console.log('Calling with userId:', userId);

    const sell = await sellService.createSell(sellBody, userId);

    console.log('Sell created successfully:', {
      sellId: sell.id,
      totalAmount: sell.totalAmount,
      status: sell.status,
    });

    // Mark cart as checked out
    console.log('\n6. Marking cart as checked out');
    await prisma.addToCart.update({
      where: { id: cartId },
      data: {
        isCheckedOut: true,
        updatedById: userId,
      },
    });
    console.log('✓ Cart marked as checked out');

    // Return updated cart with customer info
    console.log('\n7. Fetching updated cart details');
    const updatedCart = await getCartById(cartId);

    console.log('Updated cart:', {
      id: updatedCart.id,
      isCheckedOut: updatedCart.isCheckedOut,
      updatedAt: updatedCart.updatedAt,
    });

    console.log('\n=== CHECKOUT CART COMPLETE ===');
    console.log('Returning response...');

    return {
      cart: updatedCart,
      sell,
      message: 'Cart checked out successfully and converted to sale',
    };
  } catch (error) {
    console.error('\n!!! CHECKOUT CART ERROR !!!');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Stack trace:', error.stack);
    console.error('Failed at step:', error.step || 'Unknown');

    // Re-throw the error for the caller to handle
    throw error;
  }
};

// Update the service function signature
const addToWaitlist = async (data, userId) => {
  const { cartItemId, note } = data;

  if (!cartItemId || typeof cartItemId !== 'string') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Valid cartItemId is required');
  }

  // Fetch cart item with cart and customer information
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: {
      product: {
        include: {
          unitOfMeasure: true,
          category: true,
        },
      },
      shop: true,
      unitOfMeasure: true,
      cart: {
        include: {
          customer: true, // Include customer to verify it exists
        },
      },
    },
  });

  if (!cartItem) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart item not found');
  }

  // Validate cart has a customer (customerId is required for waitlist)
  if (!cartItem.cart.customerId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Cart must be associated with a customer to add to waitlist',
    );
  }

  // Check if waitlist item already exists for same product, same shop, AND same quantity
  const existingWaitlistItem = await prisma.waitlist.findFirst({
    where: {
      cartId: cartItem.cartId,
      productId: cartItem.productId,
      shopId: cartItem.shopId,
      quantity: cartItem.quantity,
      cartItemId: { not: cartItemId },
    },
  });

  let waitlist;

  if (existingWaitlistItem) {
    // Update existing waitlist item
    waitlist = await prisma.waitlist.update({
      where: { id: existingWaitlistItem.id },
      data: {
        note: note || `Updated waitlist - ${cartItem.product.name}`,
        updatedById: userId,
      },
      include: {
        user: true,
        customer: true,
        branch: true,
        cart: {
          include: {
            items: {
              include: {
                shop: true,
                product: {
                  include: {
                    category: true,
                    unitOfMeasure: true,
                  },
                },
                unitOfMeasure: true,
              },
            },
          },
        },
        cartItem: {
          include: {
            product: {
              include: {
                category: true,
                unitOfMeasure: true,
              },
            },
            unitOfMeasure: true,
            shop: true,
          },
        },
        product: {
          include: {
            category: true,
            unitOfMeasure: true,
          },
        },
        createdBy: true,
        updatedBy: true,
      },
    });
  } else {
    // Create new waitlist entry with REQUIRED customerId
    waitlist = await prisma.waitlist.create({
      data: {
        userId,
        customerId: cartItem.cart.customerId, // REQUIRED - no longer optional
        branchId: cartItem.cart.branchId || undefined,
        cartId: cartItem.cartId,
        cartItemId,
        productId: cartItem.productId,
        shopId: cartItem.shopId,
        quantity: cartItem.quantity,
        note: note || `Item moved to waitlist - ${cartItem.product.name}`,
        createdById: userId,
        updatedById: userId,
      },
      include: {
        user: true,
        customer: true,
        branch: true,
        cart: {
          include: {
            items: {
              include: {
                shop: true,
                product: {
                  include: {
                    category: true,
                    unitOfMeasure: true,
                  },
                },
                unitOfMeasure: true,
              },
            },
          },
        },
        cartItem: {
          include: {
            product: {
              include: {
                category: true,
                unitOfMeasure: true,
              },
            },
            unitOfMeasure: true,
            shop: true,
          },
        },
        product: {
          include: {
            category: true,
            unitOfMeasure: true,
          },
        },
        createdBy: true,
        updatedBy: true,
      },
    });
  }

  return waitlist;
};

// Remove item from waitlist
const removeItemFromWaitlist = async (waitlistItemId) => {
  const waitlistItem = await prisma.waitlist.findUnique({
    where: { id: waitlistItemId },
    include: {
      cart: true,
      customer: true,
    },
  });

  if (!waitlistItem) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Waitlist item not found');
  }

  await prisma.waitlist.delete({
    where: { id: waitlistItemId },
  });

  return { message: 'Item removed from waitlist successfully' };
};

// Clear entire waitlist
const clearWaitlist = async (cartId) => {
  const cart = await getCartById(cartId);
  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart not found');
  }

  await prisma.$transaction(async (tx) => {
    // Delete all waitlist items for this cart
    await tx.waitlist.deleteMany({
      where: { cartId },
    });
  });

  return { message: 'Waitlist cleared successfully' };
};

// Get waitlists by user
const getWaitlistsByUser = async (userId, filters = {}) => {
  const { startDate, endDate } = filters;

  const whereClause = {
    userId,
  };

  // Add date filters
  if (startDate || endDate) {
    whereClause.createdAt = {};
    if (startDate) whereClause.createdAt.gte = new Date(startDate);
    if (endDate) whereClause.createdAt.lte = new Date(endDate);
  }

  const waitlists = await prisma.waitlist.findMany({
    where: whereClause,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: true,
      customer: true, // Always include customer since it's required
      branch: true,
      cart: true,
      cartItem: {
        include: {
          product: true,
          unitOfMeasure: true,
          shop: true,
        },
      },
      product: true,
      createdBy: true,
      updatedBy: true,
    },
  });

  return waitlists;
};

// Convert waitlist to cart item
const convertWaitlistToCartItem = async (waitlistId, userId) => {
  const waitlist = await prisma.waitlist.findUnique({
    where: { id: waitlistId },
    include: {
      user: true,
      customer: true, // Include customer since it's required
      product: {
        include: {
          unitOfMeasure: true,
        },
      },
      cart: true,
      cartItem: {
        include: {
          shop: true,
          unitOfMeasure: true,
        },
      },
      shop: true,
    },
  });

  if (!waitlist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Waitlist entry not found');
  }

  // Validate customer exists (should always exist due to model requirement)
  if (!waitlist.customerId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Waitlist must be associated with a customer',
    );
  }

  // Check if user has permission (either waitlist user or created by user)
  if (waitlist.userId !== userId && waitlist.createdById !== userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'You can only convert your own waitlist items',
    );
  }

  // Find or create cart for user with customer association
  let cart = await prisma.addToCart.findFirst({
    where: {
      userId,
      customerId: waitlist.customerId, // Ensure cart is for the same customer
      isCheckedOut: false,
    },
    include: {
      items: true,
    },
  });

  if (!cart) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    cart = await prisma.addToCart.create({
      data: {
        userId,
        customerId: waitlist.customerId, // REQUIRED for cart
        branchId: user.branchId || waitlist.branchId,
        isCheckedOut: false,
        totalItems: 0,
        totalAmount: 0,
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  // Determine shopId - priority: waitlist.shopId > cartItem.shopId
  let { shopId } = waitlist;
  if (!shopId && waitlist.cartItem?.shopId) {
    shopId = waitlist.cartItem.shopId;
  }

  if (!shopId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Shop ID is required for cart item',
    );
  }

  // Verify shop exists
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
  });

  if (!shop) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid shop ID');
  }

  // Check if item already exists in cart (same product and shop)
  const existingCartItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId: waitlist.productId,
      shopId,
    },
  });

  let cartItem;
  const unitPrice =
    waitlist.cartItem?.unitPrice || waitlist.product?.sellPrice || 0;
  const totalPrice = waitlist.quantity * unitPrice;

  if (existingCartItem) {
    // Update existing cart item quantity and price
    cartItem = await prisma.cartItem.update({
      where: { id: existingCartItem.id },
      data: {
        quantity: existingCartItem.quantity + waitlist.quantity,
        unitPrice,
        totalPrice: existingCartItem.totalPrice + totalPrice,
        notes: `Added from waitlist: ${waitlist.note || 'No note'}`,
      },
      include: {
        shop: true,
        product: {
          include: {
            unitOfMeasure: true,
            category: true,
          },
        },
        unitOfMeasure: true,
      },
    });
  } else {
    // Create new cart item from waitlist
    cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        shopId,
        productId: waitlist.productId,
        unitOfMeasureId:
          waitlist.cartItem?.unitOfMeasureId ||
          waitlist.product?.unitOfMeasureId,
        quantity: waitlist.quantity,
        unitPrice,
        totalPrice,
        notes: `Added from waitlist: ${waitlist.note || 'No note'}`,
      },
      include: {
        shop: true,
        product: {
          include: {
            unitOfMeasure: true,
            category: true,
          },
        },
        unitOfMeasure: true,
      },
    });
  }

  // Delete the waitlist entry after converting to cart
  await prisma.waitlist.delete({
    where: { id: waitlistId },
  });

  // Update cart totals
  await updateCartTotals(cart.id);

  return {
    cartItem,
    cart: await getCartById(cart.id),
    message: 'Waitlist item successfully added to cart',
  };
};

// Delete cart
const deleteCart = async (cartId) => {
  const cart = await getCartById(cartId);
  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart not found');
  }

  await prisma.$transaction(async (tx) => {
    // Delete all cart items
    await tx.cartItem.deleteMany({
      where: { cartId },
    });

    // Delete all associated waitlists
    await tx.waitlist.deleteMany({
      where: { cartId },
    });

    // Delete the cart
    await tx.addToCart.delete({
      where: { id: cartId },
    });
  });

  return { message: 'Cart deleted successfully' };
};
// Get all waitlists (admin function)
const getAllWaitlists = async (filters = {}) => {
  const { userId, startDate, endDate } = filters;

  const whereClause = {};

  // Add user filter
  if (userId) {
    whereClause.userId = userId;
  }

  // Add date filters
  if (startDate || endDate) {
    whereClause.createdAt = {};
    if (startDate) whereClause.createdAt.gte = new Date(startDate);
    if (endDate) whereClause.createdAt.lte = new Date(endDate);
  }

  const waitlists = await prisma.waitlist.findMany({
    where: whereClause,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: true,
      customer: true,
      branch: true,
      cart: true,
      cartItem: {
        include: {
          product: true,
          unitOfMeasure: true,
        },
      },
      product: true,
      createdBy: true,
      updatedBy: true,
    },
  });

  return waitlists;
};
module.exports = {
  getCartById,
  getCartByUserId,
  getCartByIdByUser,
  getAllCarts,
  createOrUpdateCart,
  addItemToCart,
  updateCartItem,
  removeItemFromCart,
  assignCustomerToCart,
  checkoutCart,
  clearCart,
  deleteCart,
  updateCartTotals,
  // Waitlist functions
  addToWaitlist,
  clearWaitlist,
  removeItemFromWaitlist,
  getWaitlistsByUser,
  getAllWaitlists,
  convertWaitlistToCartItem,
};
