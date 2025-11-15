/* eslint-disable no-underscore-dangle */
const prisma = require('./prisma');

class InventoryDashboardService {
  static async getInventoryDashboard() {
    try {
      return await prisma.$transaction(async (tx) => {
        const methods = [
          { name: '_getKPIs', method: this._getKPIs },
          { name: '_getStockByCategory', method: this._getStockByCategory },
          {
            name: '_getStockStatusOverview',
            method: this._getStockStatusOverview,
          },
          {
            name: '_getStockMovementTimeline',
            method: this._getStockMovementTimeline,
          },
          { name: '_getExpiringBatches', method: this._getExpiringBatches },
          { name: '_getLowStockAlerts', method: this._getLowStockAlerts },
          { name: '_getTopItemsByValue', method: this._getTopItemsByValue },
          {
            name: '_getInventoryAgingReport',
            method: this._getInventoryAgingReport,
          },
        ];

        const results = await Promise.all(
          methods.map(async ({ name, method }) => {
            try {
              const result = await method.call(this, tx);

              return result;
            } catch (error) {
              console.error(`❌ Error in ${name}:`, error.message, error.stack);
              throw error;
            }
          }),
        );

        const [
          kpis,
          stockByCategory,
          statusOverview,
          movementTimeline,
          expiringSoon,
          lowStockItems,
          topItems,
          agingReport,
        ] = results;

        const dashboardData = {
          kpis,
          charts: {
            stockByCategory,
            statusOverview,
            movementTimeline,
          },
          alerts: {
            expiringSoon,
            lowStockItems,
          },
          tables: {
            topItems,
            agingReport,
          },
          lastUpdated: new Date(),
        };

        return dashboardData;
      });
    } catch (error) {
      console.error('❌ Transaction failed:', error.message, error.stack);
      throw error;
    } finally {
    }
  }

  static async _getKPIs(tx) {
    try {
      const queries = [
        { name: 'totalProducts', query: tx.product.count() },
        {
          name: 'totalStock',
          query: tx.$queryRaw`SELECT COALESCE(SUM(total_qty), 0) as "totalQuantity" FROM (SELECT SUM(ss.quantity) as total_qty FROM store_stocks ss WHERE ss.status = 'Available' UNION ALL SELECT SUM(shs.quantity) as total_qty FROM shop_stocks shs WHERE shs.status = 'Available') as combined_stocks`,
        },
        {
          name: 'totalCostValue',
          query: tx.$queryRaw`SELECT COALESCE(SUM(total_cost), 0) as "totalCost" FROM (SELECT SUM(pb.price * ss.quantity) as total_cost FROM store_stocks ss INNER JOIN product_batches pb ON ss.batchId = pb._id WHERE ss.status = 'Available' UNION ALL SELECT SUM(pb.price * shs.quantity) as total_cost FROM shop_stocks shs INNER JOIN product_batches pb ON shs.batchId = pb._id WHERE shs.status = 'Available') as combined_costs`,
        },
        {
          name: 'totalRetailValue',
          query: tx.$queryRaw`SELECT COALESCE(SUM(total_retail), 0) as "totalRetail" FROM (SELECT SUM(p.sellPrice * ss.quantity) as total_retail FROM store_stocks ss INNER JOIN product_batches pb ON ss.batchId = pb._id INNER JOIN products p ON pb.productId = p._id WHERE ss.status = 'Available' AND p.sellPrice IS NOT NULL UNION ALL SELECT SUM(p.sellPrice * shs.quantity) as total_retail FROM shop_stocks shs INNER JOIN product_batches pb ON shs.batchId = pb._id INNER JOIN products p ON pb.productId = p._id WHERE shs.status = 'Available' AND p.sellPrice IS NOT NULL) as combined_retail`,
        },
        { name: 'activeSuppliers', query: tx.supplier.count() },
        {
          name: 'openPurchases',
          query: tx.purchase.count({ where: { paymentStatus: 'PENDING' } }),
        },
        {
          name: 'pendingTransfers',
          query: tx.transfer.count({ where: { status: 'PENDING' } }),
        },
        {
          name: 'lowStockResult',
          query: tx.$queryRaw`SELECT COUNT(DISTINCT p._id) as "count" FROM products p INNER JOIN product_batches pb ON p._id = pb.productId LEFT JOIN (SELECT batchId, SUM(quantity) as total_qty FROM store_stocks WHERE status = 'Available' GROUP BY batchId UNION ALL SELECT batchId, SUM(quantity) as total_qty FROM shop_stocks WHERE status = 'Available' GROUP BY batchId) as stock ON pb._id = stock.batchId WHERE pb.warningQuantity IS NOT NULL AND COALESCE(stock.total_qty, 0) < pb.warningQuantity`,
        },
        {
          name: 'expiringSoonCount',
          query: tx.productBatch.count({
            where: {
              expiryDate: {
                lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                gte: new Date(),
              },
            },
          }),
        },
        { name: 'totalStores', query: tx.store.count() },
        { name: 'totalShops', query: tx.shop.count() },
      ];

      const results = await Promise.all(
        queries.map(async (q, index) => {
          try {
            const result = await q.query;
            return result;
          } catch (error) {
            console.error(
              `❌ KPI query ${q.name} failed:`,
              error.message,
              error.stack,
            );
            throw error;
          }
        }),
      );

      const [
        totalProducts,
        totalStockResult,
        totalCostValueResult,
        totalRetailValueResult,
        activeSuppliers,
        openPurchases,
        pendingTransfers,
        lowStockResult,
        expiringSoonCount,
        totalStores,
        totalShops,
      ] = results;

      const kpis = {
        totalProducts,
        totalQuantity: Number(totalStockResult[0]?.totalQuantity) || 0,
        inventoryValueCost: Number(totalCostValueResult[0]?.totalCost) || 0,
        inventoryValueRetail:
          Number(totalRetailValueResult[0]?.totalRetail) || 0,
        activeSuppliers,
        openPurchases,
        pendingTransfers,
        lowStockItems: Number(lowStockResult[0]?.count) || 0,
        expiringSoon: expiringSoonCount,
        totalStores,
        totalShops,
      };

      return kpis;
    } catch (error) {
      console.error('❌ _getKPIs failed:', error.message, error.stack);
      throw error;
    }
  }

  static async _getStockByCategory(tx) {
    try {
      const result = await tx.$queryRaw`
      SELECT 
        c._id as categoryId,
        c.name as category,
        COUNT(DISTINCT p._id) as productCount,
        COALESCE(SUM(combined_stocks.total_qty), 0) as totalQuantity,
        COALESCE(SUM(p.sellPrice * combined_stocks.total_qty), 0) as totalValue
      FROM categories c
      LEFT JOIN products p ON c._id = p.categoryId
      LEFT JOIN product_batches pb ON p._id = pb.productId
      LEFT JOIN (
        SELECT batchId, SUM(quantity) as total_qty 
        FROM store_stocks 
        WHERE status = 'Available'
        GROUP BY batchId
        UNION ALL
        SELECT batchId, SUM(quantity) as total_qty 
        FROM shop_stocks 
        WHERE status = 'Available'
        GROUP BY batchId
      ) as combined_stocks ON pb._id = combined_stocks.batchId
      GROUP BY c._id, c.name
      ORDER BY totalValue DESC
    `;

      return result;
    } catch (error) {
      console.error(
        '❌ _getStockByCategory failed:',
        error.message,
        error.stack,
      );
      throw error;
    }
  }

  static async _getStockStatusOverview(tx) {
    try {
      const result = await tx.$queryRaw`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(quantity) as totalQuantity
      FROM (
        SELECT status, quantity FROM store_stocks
        UNION ALL
        SELECT status, quantity FROM shop_stocks
      ) as all_stocks
      GROUP BY status
    `;

      return result;
    } catch (error) {
      console.error(
        '❌ _getStockStatusOverview failed:',
        error.message,
        error.stack,
      );
      throw error;
    }
  }

  static async _getStockMovementTimeline(tx, months = 12) {
    try {
      const dateThreshold = new Date();
      dateThreshold.setMonth(dateThreshold.getMonth() - months);

      const result = await tx.$queryRaw`
      SELECT 
        DATE_FORMAT(sl.movementDate, '%Y-%m') as month,
        sl.movementType,
        SUM(sl.quantity) as quantity
      FROM stock_ledgers sl
      WHERE sl.movementDate >= ${dateThreshold}
      GROUP BY DATE_FORMAT(sl.movementDate, '%Y-%m'), sl.movementType
      ORDER BY month ASC, sl.movementType
    `;

      return result;
    } catch (error) {
      console.error(
        '❌ _getStockMovementTimeline failed:',
        error.message,
        error.stack,
      );
      throw error;
    }
  }

  static async _getExpiringBatches(tx, days = 30) {
    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + days);

      const result = await tx.$queryRaw`
      SELECT 
        pb._id as batchId,
        pb.batchNumber,
        pb.expiryDate,
        pb.price as unitPrice,
        p.sellPrice,
        p.name as productName,
        p.productCode,
        c.name as categoryName,
        COALESCE(store_stock.total_qty, 0) + COALESCE(shop_stock.total_qty, 0) as totalQuantity
      FROM product_batches pb
      INNER JOIN products p ON pb.productId = p._id
      INNER JOIN categories c ON p.categoryId = c._id
      LEFT JOIN (
        SELECT batchId, SUM(quantity) as total_qty 
        FROM store_stocks 
        WHERE status = 'Available'
        GROUP BY batchId
      ) as store_stock ON pb._id = store_stock.batchId
      LEFT JOIN (
        SELECT batchId, SUM(quantity) as total_qty 
        FROM shop_stocks 
        WHERE status = 'Available'
        GROUP BY batchId
      ) as shop_stock ON pb._id = shop_stock.batchId
      WHERE pb.expiryDate BETWEEN ${new Date()} AND ${expiryDate}
        AND (COALESCE(store_stock.total_qty, 0) + COALESCE(shop_stock.total_qty, 0)) > 0
      GROUP BY pb._id, pb.batchNumber, pb.expiryDate, pb.price, p.sellPrice, p.name, p.productCode, c.name
      ORDER BY pb.expiryDate ASC
    `;

      return result;
    } catch (error) {
      console.error(
        '❌ _getExpiringBatches failed:',
        error.message,
        error.stack,
      );
      throw error;
    }
  }

  static async _getLowStockAlerts(tx) {
    try {
      const result = await tx.$queryRaw`
      SELECT 
        p._id,
        p.name as productName,
        p.productCode,
        pb.batchNumber,
        pb.warningQuantity,
        COALESCE(store_stock.total_qty, 0) + COALESCE(shop_stock.total_qty, 0) as currentStock,
        c.name as categoryName
      FROM products p
      INNER JOIN product_batches pb ON p._id = pb.productId
      INNER JOIN categories c ON p.categoryId = c._id
      LEFT JOIN (
        SELECT batchId, SUM(quantity) as total_qty 
        FROM store_stocks 
        WHERE status = 'Available'
        GROUP BY batchId
      ) as store_stock ON pb._id = store_stock.batchId
      LEFT JOIN (
        SELECT batchId, SUM(quantity) as total_qty 
        FROM shop_stocks 
        WHERE status = 'Available'
        GROUP BY batchId
      ) as shop_stock ON pb._id = shop_stock.batchId
      WHERE pb.warningQuantity IS NOT NULL 
        AND (COALESCE(store_stock.total_qty, 0) + COALESCE(shop_stock.total_qty, 0)) < pb.warningQuantity
        AND (COALESCE(store_stock.total_qty, 0) + COALESCE(shop_stock.total_qty, 0)) > 0
      GROUP BY p._id, p.name, p.productCode, pb.batchNumber, pb.warningQuantity, c.name
      ORDER BY (COALESCE(store_stock.total_qty, 0) + COALESCE(shop_stock.total_qty, 0)) / pb.warningQuantity ASC
    `;

      return result;
    } catch (error) {
      console.error(
        '❌ _getLowStockAlerts failed:',
        error.message,
        error.stack,
      );
      throw error;
    }
  }

  static async _getTopItemsByValue(tx, limit = 10) {
    try {
      const result = await tx.$queryRaw`
      SELECT 
        p._id,
        p.name as productName,
        p.productCode,
        c.name as category,
        SUM(COALESCE(store_stock.total_qty, 0) + COALESCE(shop_stock.total_qty, 0)) as totalQuantity,
        SUM(pb.price * (COALESCE(store_stock.total_qty, 0) + COALESCE(shop_stock.total_qty, 0))) as totalCostValue,
        SUM(p.sellPrice * (COALESCE(store_stock.total_qty, 0) + COALESCE(shop_stock.total_qty, 0))) as totalRetailValue
      FROM products p
      INNER JOIN categories c ON p.categoryId = c._id
      INNER JOIN product_batches pb ON p._id = pb.productId
      LEFT JOIN (
        SELECT batchId, SUM(quantity) as total_qty 
        FROM store_stocks 
        WHERE status = 'Available'
        GROUP BY batchId
      ) as store_stock ON pb._id = store_stock.batchId
      LEFT JOIN (
        SELECT batchId, SUM(quantity) as total_qty 
        FROM shop_stocks 
        WHERE status = 'Available'
        GROUP BY batchId
      ) as shop_stock ON pb._id = shop_stock.batchId
      WHERE (COALESCE(store_stock.total_qty, 0) + COALESCE(shop_stock.total_qty, 0)) > 0
      GROUP BY p._id, p.name, p.productCode, c.name
      ORDER BY totalCostValue DESC
      LIMIT ${limit}
    `;

      return result;
    } catch (error) {
      console.error(
        '❌ _getTopItemsByValue failed:',
        error.message,
        error.stack,
      );
      throw error;
    }
  }

  static async _getInventoryAgingReport(tx) {
    try {
      const result = await tx.$queryRaw`
      SELECT 
        p._id,
        p.name as productName,
        p.productCode,
        pb.batchNumber,
        pb.createdAt as batchDate,
        COALESCE(SUM(store_stock.total_qty), 0) + COALESCE(SUM(shop_stock.total_qty), 0) as quantity,
        DATEDIFF(NOW(), pb.createdAt) as daysInInventory,
        SUM(pb.price * (COALESCE(store_stock.total_qty, 0) + COALESCE(shop_stock.total_qty, 0))) as inventoryValue,
        c.name as categoryName
      FROM product_batches pb
      INNER JOIN products p ON pb.productId = p._id
      INNER JOIN categories c ON p.categoryId = c._id
      LEFT JOIN (
        SELECT batchId, SUM(quantity) as total_qty 
        FROM store_stocks 
        WHERE status = 'Available'
        GROUP BY batchId
      ) as store_stock ON pb._id = store_stock.batchId
      LEFT JOIN (
        SELECT batchId, SUM(quantity) as total_qty 
        FROM shop_stocks 
        WHERE status = 'Available'
        GROUP BY batchId
      ) as shop_stock ON pb._id = shop_stock.batchId
      WHERE (COALESCE(store_stock.total_qty, 0) + COALESCE(shop_stock.total_qty, 0)) > 0
      GROUP BY p._id, p.name, p.productCode, pb.batchNumber, pb.createdAt, c.name
      ORDER BY daysInInventory DESC
    `;

      console.log('✅ _getInventoryAgingReport success:', {
        recordCount: result?.length,
      });
      return result;
    } catch (error) {
      console.error(
        '❌ _getInventoryAgingReport failed:',
        error.message,
        error.stack,
      );
      throw error;
    }
  }

  static async getBatchExpirationDetails({ withinDays = 30 } = {}) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + withinDays);

    return prisma.productBatch.findMany({
      where: {
        expiryDate: {
          lte: expiryDate,
          gte: new Date(),
        },
      },
      include: {
        product: {
          select: {
            name: true,
            productCode: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
        StoreStock: {
          where: {
            status: 'Available',
          },
          select: {
            quantity: true,
            store: {
              select: {
                name: true,
              },
            },
          },
        },
        ShopStock: {
          where: {
            status: 'Available',
          },
          select: {
            quantity: true,
            shop: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        expiryDate: 'asc',
      },
    });
  }

  static async getStockSummaryByLocation() {
    return prisma.$transaction(async (tx) => {
      const [storeSummary, shopSummary] = await Promise.all([
        tx.$queryRaw`
        SELECT 
          s.name as locationName,
          'STORE' as locationType,
          COUNT(DISTINCT ss.batchId) as uniqueProducts,
          SUM(ss.quantity) as totalQuantity,
          SUM(pb.price * ss.quantity) as totalValue
        FROM stores s
        LEFT JOIN store_stocks ss ON s._id = ss.storeId AND ss.status = 'Available'
        LEFT JOIN product_batches pb ON ss.batchId = pb._id
        GROUP BY s._id, s.name
      `,

        tx.$queryRaw`
        SELECT 
          sh.name as locationName,
          'SHOP' as locationType,
          COUNT(DISTINCT shs.batchId) as uniqueProducts,
          SUM(shs.quantity) as totalQuantity,
          SUM(pb.price * shs.quantity) as totalValue
        FROM shops sh
        LEFT JOIN shop_stocks shs ON sh._id = shs.shopId AND shs.status = 'Available'
        LEFT JOIN product_batches pb ON shs.batchId = pb._id
        GROUP BY sh._id, sh.name
      `,
      ]);

      return [...storeSummary, ...shopSummary];
    });
  }
}

module.exports = InventoryDashboardService;
