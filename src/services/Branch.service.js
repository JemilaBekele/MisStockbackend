const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const prisma = require('./prisma');

// Get Branch by ID
const getBranchById = async (id) => {
  const branch = await prisma.branch.findUnique({
    where: { id },
    include: {
      Shop: true,
      Store: true,
      User: true,
    },
  });
  return branch;
};

// Get Branch by Name
const getBranchByName = async (name) => {
  const branch = await prisma.branch.findFirst({
    where: { name },
  });
  return branch;
};

// Get all Branches
const getAllBranches = async () => {
  const branches = await prisma.branch.findMany({
    orderBy: {
      name: 'asc',
    },
    include: {
      Shop: true,
      Store: true,
      User: true,
    },
  });

  return {
    branches,
    count: branches.length,
  };
};

// Create Branch
const createBranch = async (branchBody) => {
  // Check if branch with same name already exists
  if (await getBranchByName(branchBody.name)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Branch name already taken');
  }

  const branch = await prisma.branch.create({
    data: branchBody,
  });
  return branch;
};

// Update Branch
const updateBranch = async (id, updateBody) => {
  const existingBranch = await getBranchById(id);
  if (!existingBranch) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Branch not found');
  }

  // Check if name is being updated to an existing branch name
  if (updateBody.name && updateBody.name !== existingBranch.name) {
    if (await getBranchByName(updateBody.name)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Branch name already taken');
    }
  }

  const updatedBranch = await prisma.branch.update({
    where: { id },
    data: updateBody,
    include: {
      Shop: true,
      Store: true,
      User: true,
    },
  });

  return updatedBranch;
};

// Delete Branch
const deleteBranch = async (id) => {
  const existingBranch = await getBranchById(id);
  if (!existingBranch) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Branch not found');
  }

  await prisma.branch.delete({
    where: { id },
  });

  return { message: 'Branch deleted successfully' };
};

const getAllProducts = async (userId = null) => {
  // First, get user with shop access if userId is provided
  let userShops = [];
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        shops: {
          select: { id: true, name: true },
        },
      },
    });
    userShops = user?.shops || [];
  }

  // Get all shops and stores to map their names
  const [shops, stores] = await Promise.all([
    prisma.shop.findMany({
      select: { id: true, name: true },
    }),
    prisma.store.findMany({
      select: { id: true, name: true },
    }),
  ]);

  const shopMap = Object.fromEntries(shops.map((shop) => [shop.id, shop.name]));
  const storeMap = Object.fromEntries(
    stores.map((store) => [store.id, store.name]),
  );

  // Build where clause based on user shop access
  const whereClause =
    userId && userShops.length > 0
      ? {
          OR: [
            // Include products that have stock in user's accessible shops
            {
              batches: {
                some: {
                  ShopStock: {
                    some: {
                      shopId: { in: userShops.map((shop) => shop.id) },
                      status: 'Available',
                    },
                  },
                },
              },
            },
            // Also include products with additional prices in user's shops
            {
              AdditionalPrice: {
                some: {
                  shopId: { in: userShops.map((shop) => shop.id) },
                },
              },
            },
          ],
        }
      : {};

  // Get all products with their stock information
  const products = await prisma.product.findMany({
    where: whereClause,
    orderBy: {
      name: 'asc',
    },
    include: {
      category: true,
      subCategory: true,
      unitOfMeasure: true,
      AdditionalPrice: {
        include: {
          shop: true,
        },
      },
      batches: {
        include: {
          ShopStock: {
            where: { status: 'Available' }, // Only include available stock
            include: {
              shop: {
                select: { id: true, name: true },
              },
            },
          },
          StoreStock: {
            where: { status: 'Available' }, // Only include available stock
            include: {
              store: {
                select: { id: true, name: true },
              },
            },
          },
        },
      },
    },
  });

  // Calculate detailed stock information for each product
  const productsWithDetailedStock = products.map((product) => {
    const shopStocks = {};
    const storeStocks = {};
    const batchStockDetails = [];

    let totalShopStock = 0;
    let totalStoreStock = 0;

    // Initialize all shops with 0 quantity
    shops.forEach((shop) => {
      shopStocks[shop.name] = 0;
    });

    // Initialize all stores with 0 quantity
    stores.forEach((store) => {
      storeStocks[store.name] = 0;
    });

    // Calculate stock from all batches
    product.batches.forEach((batch) => {
      const batchShopStocks = {};
      const batchStoreStocks = {};
      let batchTotalStock = 0;

      // Process shop stock for this batch
      batch.ShopStock.forEach((shopStock) => {
        const shopName = shopMap[shopStock.shopId];
        const { quantity } = shopStock;

        shopStocks[shopName] = (shopStocks[shopName] || 0) + quantity;
        batchShopStocks[shopName] = (batchShopStocks[shopName] || 0) + quantity;
        totalShopStock += quantity;
        batchTotalStock += quantity;
      });

      // Process store stock for this batch
      batch.StoreStock.forEach((storeStock) => {
        const storeName = storeMap[storeStock.storeId];
        const { quantity } = storeStock;

        storeStocks[storeName] = (storeStocks[storeName] || 0) + quantity;
        batchStoreStocks[storeName] =
          (batchStoreStocks[storeName] || 0) + quantity;
        totalStoreStock += quantity;
        batchTotalStock += quantity;
      });

      // Add batch stock details
      batchStockDetails.push({
        batchId: batch.id,
        batchNumber: batch.batchNumber,
        expiryDate: batch.expiryDate,
        price: batch.price,
        shopStocks: batchShopStocks,
        storeStocks: batchStoreStocks,
        totalStock: batchTotalStock,
      });
    });

    const totalStock = totalShopStock + totalStoreStock;

    // Filter additional prices based on user shop access
    const filteredAdditionalPrices =
      userId && userShops.length > 0
        ? product.AdditionalPrice.filter(
            (price) =>
              !price.shopId ||
              userShops.some((shop) => shop.id === price.shopId),
          )
        : product.AdditionalPrice;

    return {
      ...product,
      AdditionalPrice: filteredAdditionalPrices,
      stockSummary: {
        shopStocks, // Object with shop names as keys and quantities as values
        storeStocks, // Object with store names as keys and quantities as values
        totalShopStock,
        totalStoreStock,
        totalStock,
        batchStockDetails, // Detailed stock information per batch
      },
    };
  });

  // Calculate overall totals across all products (only for accessible shops if user provided)
  const overallTotals = productsWithDetailedStock.reduce(
    (totals, product) => {
      // Calculate shop-wise totals (only for user's shops if provided)
      const shopTotals = { ...totals.shopTotals };
      Object.entries(product.stockSummary.shopStocks).forEach(
        ([shopName, quantity]) => {
          // If user has specific shops, only include those shops in totals
          if (userId && userShops.length > 0) {
            const userShopNames = userShops.map((shop) => shop.name);
            if (userShopNames.includes(shopName)) {
              shopTotals[shopName] = (shopTotals[shopName] || 0) + quantity;
            }
          } else {
            shopTotals[shopName] = (shopTotals[shopName] || 0) + quantity;
          }
        },
      );

      // Calculate store-wise totals
      const storeTotals = { ...totals.storeTotals };
      Object.entries(product.stockSummary.storeStocks).forEach(
        ([storeName, quantity]) => {
          storeTotals[storeName] = (storeTotals[storeName] || 0) + quantity;
        },
      );

      return {
        totalShopStock:
          totals.totalShopStock + product.stockSummary.totalShopStock,
        totalStoreStock:
          totals.totalStoreStock + product.stockSummary.totalStoreStock,
        totalAllStock: totals.totalAllStock + product.stockSummary.totalStock,
        shopTotals,
        storeTotals,
      };
    },
    {
      totalShopStock: 0,
      totalStoreStock: 0,
      totalAllStock: 0,
      shopTotals: Object.fromEntries(
        (userId && userShops.length > 0 ? userShops : shops).map((shop) => [
          shop.name,
          0,
        ]),
      ),
      storeTotals: Object.fromEntries(stores.map((store) => [store.name, 0])),
    },
  );

  // Add overallTotals to each product
  const productsWithTotals = productsWithDetailedStock.map((product) => ({
    ...product,
    overallTotals,
  }));

  return {
    products: productsWithTotals,
    count: products.length,
    userAccessibleShops: userShops, // Return user's accessible shops for frontend reference
    // overallTotals removed from here
  };
};

module.exports = {
  getBranchById,
  getBranchByName,
  getAllBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  getAllProducts,
};
