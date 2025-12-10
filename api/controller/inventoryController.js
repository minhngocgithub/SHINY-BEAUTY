const logger = require("../config/logger");
const InventoryService = require("../services/inventory.service");
const { asyncHandler, AppError } = require("../middleware/errorHandler.middleware");
const { redisClient } = require("../config/redis");

// ========== ANALYTICS & OVERVIEW ==========

/**
 * Get inventory analytics
 * GET /api/v1/inventory/analytics
 */
const getInventoryAnalytics = asyncHandler(async (req, res) => {
  const { lowStockThreshold = 10 } = req.query;
  
  const analytics = await InventoryService.getInventoryAnalytics({ 
    lowStockThreshold: Number(lowStockThreshold) 
  });

  res.status(200).json({
    success: true,
    data: analytics,
  });
});

/**
 * Get low stock products
 * GET /api/v1/inventory/low-stock
 */
const getLowStockProducts = asyncHandler(async (req, res) => {
  const { threshold = 10, limit = 50 } = req.query;

  const lowStockData = await InventoryService.getLowStockProducts(
    Number(threshold),
    Number(limit)
  );

  res.status(200).json({
    success: true,
    data: lowStockData,
  });
});

// ========== STOCK LEVEL QUERIES ==========

/**
 * Get stock level for single product
 * GET /api/v1/inventory/stock/:productId
 */
const getStockLevel = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { forceDB = false } = req.query;

  const stock = await InventoryService.getStockLevel(productId, { 
    forceDB: forceDB === 'true' 
  });

  res.status(200).json({
    success: true,
    productId,
    stock,
  });
});

/**
 * Validate stock availability for multiple items
 * POST /api/v1/inventory/validate
 */
const validateStockAvailability = asyncHandler(async (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new AppError("Items array is required", 400);
  }

  const validation = await InventoryService.validateStockAvailability(items);

  res.status(200).json({
    success: true,
    data: validation,
  });
});

/**
 * Get stock levels for multiple products at once
 * POST /api/v1/inventory/stock/bulk
 */
const getBulkStockLevels = asyncHandler(async (req, res) => {
  const { productIds } = req.body;

  if (!productIds || !Array.isArray(productIds)) {
    throw new AppError("Product IDs array is required", 400);
  }

  const stockLevels = await Promise.all(
    productIds.map(async (productId) => {
      const stock = await InventoryService.getStockLevel(productId);
      return { productId, stock };
    })
  );

  res.status(200).json({
    success: true,
    data: stockLevels,
  });
});

// ========== RESERVATION SYSTEM ==========

/**
 * Reserve stock for checkout
 * POST /api/v1/inventory/reserve
 */
const reserveStock = asyncHandler(async (req, res) => {
  const { items } = req.body;
  const userId = req.user._id;

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new AppError("Items array is required", 400);
  }

  const reservation = await InventoryService.reserveStock(userId, items);

  res.status(200).json({
    success: true,
    message: "Stock reserved successfully",
    data: reservation,
  });
});

/**
 * Get reservation details
 * GET /api/v1/inventory/reserve/:reservationId
 */
const getReservation = asyncHandler(async (req, res) => {
  const { reservationId } = req.params;

  const reservation = await redisClient.hgetall(reservationId);
  const meta = await redisClient.hgetall(`${reservationId}:meta`);

  if (!reservation || Object.keys(reservation).length === 0) {
    throw new AppError("Reservation not found or expired", 404);
  }

  res.status(200).json({
    success: true,
    data: {
      reservationId,
      items: reservation,
      meta,
    },
  });
});

/**
 * Cancel reservation
 * POST /api/v1/inventory/reserve/:reservationId/cancel
 */
const cancelReservation = asyncHandler(async (req, res) => {
  const { reservationId } = req.params;

  const result = await InventoryService.cancelReservation(reservationId);

  res.status(200).json({
    success: true,
    message: "Reservation cancelled successfully",
    data: result,
  });
});

/**
 * Confirm reservation after payment
 * POST /api/v1/inventory/reserve/:reservationId/confirm
 */
const confirmReservation = asyncHandler(async (req, res) => {
  const { reservationId } = req.params;
  const { orderId } = req.body;

  if (!orderId) {
    throw new AppError("Order ID is required", 400);
  }

  const result = await InventoryService.confirmReservation(reservationId, orderId);

  res.status(200).json({
    success: true,
    message: "Stock confirmed and deducted",
    data: result,
  });
});

// ========== ADMIN STOCK MANAGEMENT ==========

/**
 * Manually adjust stock
 * POST /api/v1/inventory/adjust/:productId
 */
const adjustStock = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity, reason, type = "adjustment" } = req.body;

  if (!quantity || quantity === 0) {
    throw new AppError("Quantity is required and cannot be zero", 400);
  }

  const Product = require("../models/product.models");
  const product = await Product.findById(productId);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  product.updateStock(Number(quantity), type, {
    reason: reason || "Manual adjustment by admin",
    by: req.user._id,
  });

  await product.save();

  // Sync to Redis
  await redisClient.setex(`inv:stock:${productId}`, 3600, product.countInstock);

  logger.info("Stock adjusted manually", {
    productId,
    quantity,
    newStock: product.countInstock,
    by: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: "Stock adjusted successfully",
    data: {
      product: {
        id: product._id,
        name: product.name,
        stock: product.countInstock,
        reservedStock: product.reservedStock,
        availableStock: product.availableStock,
      },
    },
  });
});

/**
 * Restock product
 * POST /api/v1/inventory/restock/:productId
 */
const restockProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity, reason, supplier } = req.body;

  if (!quantity || quantity <= 0) {
    throw new AppError("Quantity must be greater than 0", 400);
  }

  const Product = require("../models/product.models");
  const product = await Product.findById(productId);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  product.restock(Number(quantity), {
    reason: reason || `Restocked from ${supplier || "supplier"}`,
    by: req.user._id,
  });

  await product.save();

  // Sync to Redis
  await redisClient.setex(`inv:stock:${productId}`, 3600, product.countInstock);

  logger.info("Product restocked", {
    productId,
    quantity,
    newStock: product.countInstock,
    by: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: "Product restocked successfully",
    data: {
      product: {
        id: product._id,
        name: product.name,
        stock: product.countInstock,
        availableStock: product.availableStock,
      },
    },
  });
});

/**
 * Process return (add back to stock)
 * POST /api/v1/inventory/return/:productId
 */
const processReturn = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity, orderId, reason } = req.body;

  if (!quantity || quantity <= 0) {
    throw new AppError("Quantity must be greater than 0", 400);
  }

  const Product = require("../models/product.models");
  const product = await Product.findById(productId);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  product.processReturn(Number(quantity), {
    orderId,
    reason: reason || "Customer return",
    by: req.user._id,
  });

  await product.save();

  // Sync to Redis
  await redisClient.setex(`inv:stock:${productId}`, 3600, product.countInstock);

  logger.info("Return processed", {
    productId,
    quantity,
    newStock: product.countInstock,
    orderId,
    by: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: "Return processed successfully",
    data: {
      product: {
        id: product._id,
        name: product.name,
        stock: product.countInstock,
        availableStock: product.availableStock,
      },
    },
  });
});

/**
 * Update stock thresholds
 * PATCH /api/v1/inventory/threshold/:productId
 */
const updateStockThreshold = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { lowStockThreshold, reorderPoint } = req.body;

  const Product = require("../models/product.models");
  const product = await Product.findByIdAndUpdate(
    productId,
    {
      ...(lowStockThreshold !== undefined && { lowStockThreshold: Number(lowStockThreshold) }),
      ...(reorderPoint !== undefined && { reorderPoint: Number(reorderPoint) }),
    },
    { new: true, runValidators: true }
  );

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  logger.info("Stock thresholds updated", {
    productId,
    lowStockThreshold: product.lowStockThreshold,
    reorderPoint: product.reorderPoint,
    by: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: "Thresholds updated successfully",
    data: {
      product: {
        id: product._id,
        name: product.name,
        lowStockThreshold: product.lowStockThreshold,
        reorderPoint: product.reorderPoint,
      },
    },
  });
});

// ========== STOCK HISTORY & AUDIT ==========

/**
 * Get stock movement history
 * GET /api/v1/inventory/history/:productId
 */
const getStockHistory = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { limit = 50, skip = 0 } = req.query;

  const Product = require("../models/product.models");
  const product = await Product.findById(productId)
    .select("inventoryHistory name countInstock")
    .populate("inventoryHistory.by", "name email")
    .populate("inventoryHistory.orderId", "orderNumber");

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const history = product.inventoryHistory
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(Number(skip), Number(skip) + Number(limit));

  res.status(200).json({
    success: true,
    data: {
      productName: product.name,
      currentStock: product.countInstock,
      history,
      total: product.inventoryHistory.length,
    },
  });
});

/**
 * Get all active reservations
 * GET /api/v1/inventory/reservations
 */
const getAllReservations = asyncHandler(async (req, res) => {
  const keys = await redisClient.keys("inv:reserve:*");
  
  // Filter out meta keys
  const reservationKeys = keys.filter(key => !key.includes(':meta'));

  const reservations = await Promise.all(
    reservationKeys.map(async (key) => {
      const items = await redisClient.hgetall(key);
      const meta = await redisClient.hgetall(`${key}:meta`);
      const ttl = await redisClient.ttl(key);

      return {
        reservationId: key,
        items,
        meta,
        expiresIn: ttl,
      };
    })
  );

  res.status(200).json({
    success: true,
    count: reservations.length,
    data: reservations,
  });
});

/**
 * Get expired reservations
 * GET /api/v1/inventory/reservations/expired
 */
const getExpiredReservations = asyncHandler(async (req, res) => {
  // This would typically be handled by Redis TTL
  // But we can check for reservations about to expire
  const keys = await redisClient.keys("inv:reserve:*");
  const reservationKeys = keys.filter(key => !key.includes(':meta'));

  const expiringReservations = [];

  for (const key of reservationKeys) {
    const ttl = await redisClient.ttl(key);
    if (ttl > 0 && ttl < 60) { // Less than 1 minute remaining
      const items = await redisClient.hgetall(key);
      const meta = await redisClient.hgetall(`${key}:meta`);
      
      expiringReservations.push({
        reservationId: key,
        items,
        meta,
        expiresIn: ttl,
      });
    }
  }

  res.status(200).json({
    success: true,
    count: expiringReservations.length,
    data: expiringReservations,
  });
});

// ========== CACHE MANAGEMENT ==========

/**
 * Sync stock cache with database
 * POST /api/v1/inventory/sync-cache
 */
const syncStockCache = asyncHandler(async (req, res) => {
  if (req.user?.role !== "admin") {
    throw new AppError("Unauthorized", 403);
  }

  const result = await InventoryService.syncStockCache();

  logger.info("Stock cache sync initiated by admin", {
    userId: req.user._id,
    result,
  });

  res.status(200).json({
    success: true,
    message: "Stock cache synced successfully",
    data: result,
  });
});

/**
 * Refresh cache for specific product
 * POST /api/v1/inventory/cache/refresh/:productId
 */
const refreshProductCache = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const stock = await InventoryService.getStockLevel(productId, { forceDB: true });

  res.status(200).json({
    success: true,
    message: "Product cache refreshed",
    data: { productId, stock },
  });
});

/**
 * Clear all stock cache
 * DELETE /api/v1/inventory/cache
 */
const clearStockCache = asyncHandler(async (req, res) => {
  const keys = await redisClient.keys("inv:stock:*");
  
  if (keys.length > 0) {
    await redisClient.del(...keys);
  }

  logger.warn("Stock cache cleared by admin", {
    userId: req.user._id,
    clearedKeys: keys.length,
  });

  res.status(200).json({
    success: true,
    message: `Cleared ${keys.length} stock cache entries`,
  });
});

// ========== REPORTS ==========

/**
 * Get inventory valuation report
 * GET /api/v1/inventory/reports/valuation
 */
const getInventoryValuation = asyncHandler(async (req, res) => {
  const Product = require("../models/product.models");

  const valuation = await Product.aggregate([
    {
      $match: { countInstock: { $gt: 0 } }
    },
    {
      $project: {
        name: 1,
        countInstock: 1,
        price: 1,
        value: { $multiply: ["$countInstock", "$price"] }
      }
    },
    {
      $group: {
        _id: null,
        totalValue: { $sum: "$value" },
        totalItems: { $sum: "$countInstock" },
        productCount: { $sum: 1 },
        products: { $push: "$$ROOT" }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: valuation[0] || { totalValue: 0, totalItems: 0, productCount: 0, products: [] },
  });
});

/**
 * Get stock movement report
 * GET /api/v1/inventory/reports/movements
 */
const getStockMovementReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, type } = req.query;

  const Product = require("../models/product.models");

  const matchConditions = {};
  if (startDate) {
    matchConditions["inventoryHistory.createdAt"] = { 
      $gte: new Date(startDate) 
    };
  }
  if (endDate) {
    matchConditions["inventoryHistory.createdAt"] = { 
      ...matchConditions["inventoryHistory.createdAt"],
      $lte: new Date(endDate) 
    };
  }

  const products = await Product.find(matchConditions)
    .select("name inventoryHistory")
    .lean();

  const movements = products.flatMap(product => 
    product.inventoryHistory
      .filter(h => {
        const date = new Date(h.createdAt);
        const matchesDate = (!startDate || date >= new Date(startDate)) && 
                           (!endDate || date <= new Date(endDate));
        const matchesType = !type || h.type === type;
        return matchesDate && matchesType;
      })
      .map(h => ({
        productId: product._id,
        productName: product.name,
        ...h
      }))
  );

  res.status(200).json({
    success: true,
    count: movements.length,
    data: movements.sort((a, b) => b.createdAt - a.createdAt),
  });
});

/**
 * Get products needing restock
 * GET /api/v1/inventory/reports/restock-needed
 */
const getRestockNeeded = asyncHandler(async (req, res) => {
  const Product = require("../models/product.models");

  const products = await Product.find({
    $expr: { $lte: ["$countInstock", "$reorderPoint"] }
  })
    .select("name countInstock reorderPoint lowStockThreshold sold category")
    .sort("countInstock")
    .lean();

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

module.exports = {
  // Analytics
  getInventoryAnalytics,
  getLowStockProducts,

  // Stock queries
  getStockLevel,
  validateStockAvailability,
  getBulkStockLevels,

  // Reservations
  reserveStock,
  getReservation,
  cancelReservation,
  confirmReservation,

  // Admin management
  adjustStock,
  restockProduct,
  processReturn,
  updateStockThreshold,

  // History & Audit
  getStockHistory,
  getAllReservations,
  getExpiredReservations,

  // Cache
  syncStockCache,
  refreshProductCache,
  clearStockCache,

  // Reports
  getInventoryValuation,
  getStockMovementReport,
  getRestockNeeded,
};