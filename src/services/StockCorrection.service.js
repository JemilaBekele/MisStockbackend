const httpStatus = require('http-status');
const { subMonths } = require('date-fns');

const ApiError = require('../utils/ApiError');
const prisma = require('./prisma');

// Get StockCorrection by ID
const getStockCorrectionById = async (id) => {
  const stockCorrection = await prisma.stockCorrection.findUnique({
    where: { id },
    include: {
      store: true,
      shop: true,
      purchase: true,
      transfer: true,
      createdBy: true,
      updatedBy: true,
      items: {
        include: {
          product: true,
          batch: true,
          unitOfMeasure: true,
        },
      },
    },
  });
  return stockCorrection;
};

const getStockCorrectionsByPurchaseId = async (purchaseId) => {
  const stockCorrections = await prisma.stockCorrection.findMany({
    where: {
      purchaseId,
    },
    include: {
      store: true,
      shop: true,
      purchase: true,
      transfer: true,
      createdBy: true,
      updatedBy: true,
      items: {
        include: {
          product: true,
          batch: true,
          unitOfMeasure: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc', // Optional: order by creation date, newest first
    },
  });
  return stockCorrections;
};
// Get StockCorrection by reference
const getStockCorrectionByReference = async (reference) => {
  const stockCorrection = await prisma.stockCorrection.findFirst({
    where: { reference },
  });
  return stockCorrection;
};

// Get all StockCorrections
const getAllStockCorrections = async ({ startDate, endDate } = {}) => {
  const whereClause = {};
  const threeMonthsAgo = subMonths(new Date(), 12); // Default time range

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
      gte: threeMonthsAgo,
      lte: endDateObj,
    };
  } else {
    whereClause.createdAt = {
      gte: threeMonthsAgo,
    };
  }

  const stockCorrections = await prisma.stockCorrection.findMany({
    where: whereClause,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      store: true,
      shop: true,
      _count: {
        select: { items: true },
      },
    },
  });

  return {
    stockCorrections,
    count: stockCorrections.length,
  };
};
const generateShortCode = async () => {
  const count = await prisma.stockCorrection.count();
  return `SC-${String(count + 1).padStart(6, '0')}`;
};
// Create StockCorrection
const createStockCorrection = async (stockCorrectionBody, userId) => {
  // Check if reference already exists
  const shortCode = await generateShortCode();

  // if (
  //   stockCorrectionBody.reference &&
  //   (await getStockCorrectionByReference(stockCorrectionBody.reference))
  // ) {
  //   throw new ApiError(
  //     httpStatus.BAD_REQUEST,
  //     'Stock correction reference already taken',
  //   );
  // }

  // Parse items if it's a string
  const { items: itemsString, ...restStockCorrectionBody } =
    stockCorrectionBody;
  const items =
    typeof itemsString === 'string' ? JSON.parse(itemsString) : itemsString;

  // Validate items
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Stock correction must have at least one item',
    );
  }

  // Validate individual item properties
  items.forEach((item, index) => {
    if (!item.productId || !item.unitOfMeasureId) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Item ${
          index + 1
        } is missing required fields (productId or unitOfMeasureId)`,
      );
    }
    if (
      item.quantity === undefined ||
      item.quantity === null ||
      Number.isNaN(item.quantity)
    ) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Item ${index + 1} has invalid quantity`,
      );
    }
    if (item.quantity === 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Item ${index + 1} quantity cannot be zero`,
      );
    }
  });

  // Clean up empty string values
  const cleanedStockCorrectionBody = {
    ...restStockCorrectionBody,
    storeId:
      restStockCorrectionBody.storeId === ''
        ? null
        : restStockCorrectionBody.storeId,
    shopId:
      restStockCorrectionBody.shopId === ''
        ? null
        : restStockCorrectionBody.shopId,
    purchaseId:
      restStockCorrectionBody.purchaseId === ''
        ? null
        : restStockCorrectionBody.purchaseId,
    transferId:
      restStockCorrectionBody.transferId === ''
        ? null
        : restStockCorrectionBody.transferId,
  };

  // Validate location
  if (
    !cleanedStockCorrectionBody.storeId &&
    !cleanedStockCorrectionBody.shopId
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Either store or shop must be specified',
    );
  }

  // Create the stock correction
  const stockCorrection = await prisma.stockCorrection.create({
    data: {
      ...cleanedStockCorrectionBody,
      shortCode, // Add this field
      createdById: userId,
      updatedById: userId,
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          batchId: item.batchId || null,
          unitOfMeasureId: item.unitOfMeasureId,
          quantity: item.quantity,
        })),
      },
    },
    include: {
      items: {
        include: {
          unitOfMeasure: true,
          product: true,
          batch: true,
        },
      },
    },
  });

  return stockCorrection;
};

// Update StockCorrection
const updateStockCorrection = async (
  stockCorrectionId,
  stockCorrectionBody,
  userId,
) => {
  // Check if stock correction exists
  const existingStockCorrection = await getStockCorrectionById(
    stockCorrectionId,
  );
  if (!existingStockCorrection) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stock correction not found');
  }

  // Cannot update approved or rejected stock corrections
  if (existingStockCorrection.status !== 'PENDING') {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Cannot update ${existingStockCorrection.status.toLowerCase()} stock correction`,
    );
  }

  // Check if reference already exists (excluding current stock correction)
  if (
    stockCorrectionBody.reference &&
    stockCorrectionBody.reference !== existingStockCorrection.reference
  ) {
    if (await getStockCorrectionByReference(stockCorrectionBody.reference)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Stock correction reference already taken',
      );
    }
  }

  // Parse items if it's a string
  const { items: itemsString, ...restStockCorrectionBody } =
    stockCorrectionBody;
  const items =
    typeof itemsString === 'string' ? JSON.parse(itemsString) : itemsString;

  // Validate items
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Stock correction must have at least one item',
    );
  }

  // Validate individual item properties
  items.forEach((item, index) => {
    if (!item.productId || !item.unitOfMeasureId) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Item ${
          index + 1
        } is missing required fields (productId or unitOfMeasureId)`,
      );
    }
  });

  // Clean up empty string values
  const cleanedStockCorrectionBody = {
    ...restStockCorrectionBody,
    storeId:
      restStockCorrectionBody.storeId === ''
        ? null
        : restStockCorrectionBody.storeId,
    shopId:
      restStockCorrectionBody.shopId === ''
        ? null
        : restStockCorrectionBody.shopId,
    purchaseId:
      restStockCorrectionBody.purchaseId === ''
        ? null
        : restStockCorrectionBody.purchaseId,
    transferId:
      restStockCorrectionBody.transferId === ''
        ? null
        : restStockCorrectionBody.transferId,
  };

  // Validate location
  if (
    !cleanedStockCorrectionBody.storeId &&
    !cleanedStockCorrectionBody.shopId
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Either store or shop must be specified',
    );
  }

  // Update the stock correction inside a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Delete all existing items
    await tx.stockCorrectionItem.deleteMany({
      where: { correctionId: stockCorrectionId },
    });

    // Update stock correction with cleaned body and new items
    const stockCorrection = await tx.stockCorrection.update({
      where: { id: stockCorrectionId },
      data: {
        ...cleanedStockCorrectionBody,
        updatedById: userId,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            batchId: item.batchId || null,
            unitOfMeasureId: item.unitOfMeasureId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: {
          include: {
            unitOfMeasure: true,
          },
        },
      },
    });

    return stockCorrection;
  });

  return result;
};

// Delete StockCorrection
const deleteStockCorrection = async (id, userId) => {
  const existingStockCorrection = await getStockCorrectionById(id);
  if (!existingStockCorrection) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stock correction not found');
  }

  const result = await prisma.$transaction(async (tx) => {
    // Check if stock correction is approved (has stock ledger entries)
    const ledgerEntries = await tx.stockLedger.findMany({
      where: {
        invoiceNo: existingStockCorrection.shortCode,
      },
    });

    const isApproved = ledgerEntries.length > 0;

    if (isApproved) {
      // Reverse all stock operations for approved stock correction
      await Promise.all(
        existingStockCorrection.items.map(async (item) => {
          const operations = [];
          const originalQuantity = item.quantity;
          const isAddition = originalQuantity > 0;
          const absoluteQuantity = Math.abs(originalQuantity);

          // Reverse the stock adjustment (opposite operation)
          if (existingStockCorrection.storeId) {
            const existingStoreStock = await tx.storeStock.findUnique({
              where: {
                storeId_batchId: {
                  storeId: existingStockCorrection.storeId,
                  batchId: item.batchId || 'no-batch',
                },
              },
            });

            if (existingStoreStock) {
              const newQuantity = isAddition
                ? existingStoreStock.quantity - absoluteQuantity // Was addition, now subtract
                : existingStoreStock.quantity + absoluteQuantity; // Was subtraction, now add

              if (newQuantity <= 0) {
                // Delete if quantity becomes 0 or negative
                operations.push(
                  tx.storeStock.delete({
                    where: {
                      storeId_batchId: {
                        storeId: existingStockCorrection.storeId,
                        batchId: item.batchId || 'no-batch',
                      },
                    },
                  }),
                );
              } else {
                // Update quantity with reverse operation
                operations.push(
                  tx.storeStock.update({
                    where: {
                      storeId_batchId: {
                        storeId: existingStockCorrection.storeId,
                        batchId: item.batchId || 'no-batch',
                      },
                    },
                    data: {
                      quantity: isAddition
                        ? { decrement: absoluteQuantity }
                        : { increment: absoluteQuantity },
                    },
                  }),
                );
              }
            }
          } else if (existingStockCorrection.shopId) {
            const existingShopStock = await tx.shopStock.findUnique({
              where: {
                shopId_batchId: {
                  shopId: existingStockCorrection.shopId,
                  batchId: item.batchId || 'no-batch',
                },
              },
            });

            if (existingShopStock) {
              const newQuantity = isAddition
                ? existingShopStock.quantity - absoluteQuantity // Was addition, now subtract
                : existingShopStock.quantity + absoluteQuantity; // Was subtraction, now add

              if (newQuantity <= 0) {
                // Delete if quantity becomes 0 or negative
                operations.push(
                  tx.shopStock.delete({
                    where: {
                      shopId_batchId: {
                        shopId: existingStockCorrection.shopId,
                        batchId: item.batchId || 'no-batch',
                      },
                    },
                  }),
                );
              } else {
                // Update quantity with reverse operation
                operations.push(
                  tx.shopStock.update({
                    where: {
                      shopId_batchId: {
                        shopId: existingStockCorrection.shopId,
                        batchId: item.batchId || 'no-batch',
                      },
                    },
                    data: {
                      quantity: isAddition
                        ? { decrement: absoluteQuantity }
                        : { increment: absoluteQuantity },
                    },
                  }),
                );
              }
            }
          }

          // Create reversal stock ledger entry (opposite movement type)
          const reversalMovementType = isAddition ? 'OUT' : 'IN';
          const reversalNotes = `Stock correction reversal: ${existingStockCorrection.reason.toLowerCase()}`;

          if (existingStockCorrection.storeId) {
            operations.push(
              tx.stockLedger.create({
                data: {
                  batchId: item.batchId,
                  storeId: existingStockCorrection.storeId,
                  invoiceNo: `REV-${existingStockCorrection.shortCode}`,
                  movementType: reversalMovementType,
                  quantity: absoluteQuantity,
                  unitOfMeasureId: item.unitOfMeasureId,
                  reference: `STOCK-CORRECTION-REVERSAL-${existingStockCorrection.reason}`,
                  userId,
                  notes: reversalNotes,
                  movementDate: new Date(),
                },
              }),
            );
          } else if (existingStockCorrection.shopId) {
            operations.push(
              tx.stockLedger.create({
                data: {
                  batchId: item.batchId,
                  invoiceNo: `REV-${existingStockCorrection.shortCode}`,
                  shopId: existingStockCorrection.shopId,
                  movementType: reversalMovementType,
                  quantity: absoluteQuantity,
                  unitOfMeasureId: item.unitOfMeasureId,
                  reference: `SHOP-CORRECTION-REVERSAL-${existingStockCorrection.reason}`,
                  userId,
                  notes: reversalNotes,
                  movementDate: new Date(),
                },
              }),
            );
          }

          // Execute all operations for this item
          if (operations.length > 0) {
            await Promise.all(operations);
          }
        }),
      );

      // Delete the original stock ledger entries
      await tx.stockLedger.deleteMany({
        where: {
          invoiceNo: existingStockCorrection.shortCode,
        },
      });
    }

    // Delete all stock correction items
    await tx.stockCorrectionItem.deleteMany({
      where: { correctionId: id },
    });

    // Delete the stock correction
    await tx.stockCorrection.delete({
      where: { id },
    });

    // Create log entry
    await tx.log.create({
      data: {
        action: `Deleted stock correction ${existingStockCorrection.shortCode}${
          isApproved ? ' and reversed stock transactions' : ''
        }`,
        userId,
      },
    });

    return {
      message: `Stock correction deleted successfully${
        isApproved ? ' and stock transactions reversed' : ''
      }`,
      stockReversed: isApproved,
    };
  });

  return result;
};

// Approve StockCorrection
const approveStockCorrection = async (stockCorrectionId, userId) => {
  const stockCorrection = await getStockCorrectionById(stockCorrectionId);

  if (!stockCorrection) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stock correction not found');
  }

  if (stockCorrection.status !== 'PENDING') {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Stock correction is already ${stockCorrection.status.toLowerCase()}`,
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    // Get all unit of measures for the stock correction items
    const unitOfMeasureIds = stockCorrection.items.map(
      (item) => item.unitOfMeasureId,
    );
    const unitOfMeasures = await tx.unitOfMeasure.findMany({
      where: { id: { in: unitOfMeasureIds } },
    });

    const unitOfMeasureMap = unitOfMeasures.reduce((acc, uom) => {
      acc[uom.id] = uom;
      return acc;
    }, {});

    // Prepare all operations for each stock correction item
    const operations = stockCorrection.items.map((item) => {
      const unitOfMeasure = unitOfMeasureMap[item.unitOfMeasureId];

      if (!unitOfMeasure) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          `Unit of measure not found for item ${item.id}`,
        );
      }

      const quantityToUse = item.quantity;
      const isAddition = quantityToUse > 0;
      const movementType = isAddition ? 'IN' : 'OUT';
      const absoluteQuantity = Math.abs(quantityToUse);
      const notes = isAddition
        ? `Stock addition: ${stockCorrection.reason.toLowerCase()}`
        : `Stock subtraction: ${stockCorrection.reason.toLowerCase()}`;

      const itemOperations = [];

      // Update stock based on location (store or shop)
      if (stockCorrection.storeId) {
        itemOperations.push(
          tx.storeStock.upsert({
            where: {
              storeId_batchId: {
                storeId: stockCorrection.storeId,
                batchId: item.batchId || 'no-batch', // Handle cases where batchId is null
              },
            },
            update: {
              quantity: isAddition
                ? { increment: absoluteQuantity }
                : { decrement: absoluteQuantity },
            },
            create: {
              storeId: stockCorrection.storeId,
              batchId: item.batchId || 'no-batch',
              quantity: isAddition ? absoluteQuantity : -absoluteQuantity,
              unitOfMeasureId: item.unitOfMeasureId,
              status: 'Available',
            },
          }),
        );
      } else if (stockCorrection.shopId) {
        itemOperations.push(
          tx.shopStock.upsert({
            where: {
              shopId_batchId: {
                shopId: stockCorrection.shopId,
                batchId: item.batchId || 'no-batch',
              },
            },
            update: {
              quantity: isAddition
                ? { increment: absoluteQuantity }
                : { decrement: absoluteQuantity },
            },
            create: {
              shopId: stockCorrection.shopId,
              batchId: item.batchId || 'no-batch',
              quantity: isAddition ? absoluteQuantity : -absoluteQuantity,
              unitOfMeasureId: item.unitOfMeasureId,
              status: 'Available',
            },
          }),
        );
      }

      // Create stock ledger entry
      if (stockCorrection.storeId) {
        itemOperations.push(
          tx.stockLedger.create({
            data: {
              batchId: item.batchId,
              storeId: stockCorrection.storeId,
              invoiceNo: stockCorrection.shortCode,

              movementType,
              quantity: absoluteQuantity,
              unitOfMeasureId: item.unitOfMeasureId,
              reference:
                stockCorrection.reference ||
                `STOCK-CORRECTION-${stockCorrection.reason}`,
              userId,
              notes,
              movementDate: new Date(),
            },
          }),
        );
      } else if (stockCorrection.shopId) {
        itemOperations.push(
          tx.stockLedger.create({
            data: {
              batchId: item.batchId,
              invoiceNo: stockCorrection.shortCode,
              shopId: stockCorrection.shopId,
              movementType,
              quantity: absoluteQuantity,
              unitOfMeasureId: item.unitOfMeasureId,
              reference:
                stockCorrection.reference ||
                `SHOP-CORRECTION-${stockCorrection.reason}`,
              userId,
              notes,
              movementDate: new Date(),
            },
          }),
        );
      }

      return itemOperations;
    });

    // Flatten all operations and execute them in parallel
    const allOperations = operations.flat();
    await Promise.all(allOperations);

    // Update stock correction status to APPROVED
    const updatedStockCorrection = await tx.stockCorrection.update({
      where: { id: stockCorrectionId },
      data: {
        status: 'APPROVED',
        updatedById: userId,
      },
    });

    // Create log entry
    await tx.log.create({
      data: {
        action: `Approved stock correction ${
          stockCorrection.reference || stockCorrection.id
        } with ${stockCorrection.items.length} items`,
        userId,
      },
    });

    return updatedStockCorrection;
  });

  return result;
};

// Reject StockCorrection
const rejectStockCorrection = async (stockCorrectionId, userId) => {
  const stockCorrection = await getStockCorrectionById(stockCorrectionId);

  if (!stockCorrection) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stock correction not found');
  }

  if (stockCorrection.status !== 'PENDING') {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Cannot reject ${stockCorrection.status.toLowerCase()} stock correction`,
    );
  }

  const updatedStockCorrection = await prisma.stockCorrection.update({
    where: { id: stockCorrectionId },
    data: {
      status: 'REJECTED',
      updatedById: userId,
    },
  });

  // Create log entry
  await prisma.log.create({
    data: {
      action: `Rejected stock correction ${
        stockCorrection.reference || stockCorrection.id
      }`,
      userId,
    },
  });

  return updatedStockCorrection;
};

module.exports = {
  getStockCorrectionById,
  getStockCorrectionByReference,
  getAllStockCorrections,
  createStockCorrection,
  updateStockCorrection,
  deleteStockCorrection,
  approveStockCorrection,
  rejectStockCorrection,
  getStockCorrectionsByPurchaseId,
};
