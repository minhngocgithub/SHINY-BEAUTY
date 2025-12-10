const express = require('express');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');
const inventoryController = require('../controller/inventoryController');

const router = express.Router();

// Get overall inventory analytics (admin only)
router.get("/analytics", authenticate, authorizeAdmin, inventoryController.getInventoryAnalytics);

// Get low stock products with alerts (admin only)
router.get("/low-stock", authenticate, authorizeAdmin, inventoryController.getLowStockProducts);

// ========== STOCK LEVEL QUERIES ==========
// Get stock level for a single product (public)
router.get("/stock/:productId", inventoryController.getStockLevel);

// Bulk check stock availability for multiple products
router.post("/validate", inventoryController.validateStockAvailability);

// Get stock levels for multiple products at once
router.post("/stock/bulk", inventoryController.getBulkStockLevels);

// ========== RESERVATION SYSTEM ==========
// Reserve stock for checkout (authenticated users)
router.post("/reserve", authenticate, inventoryController.reserveStock);

// Get reservation details
router.get("/reserve/:reservationId", authenticate, inventoryController.getReservation);

// Cancel/release reservation
router.post("/reserve/:reservationId/cancel", authenticate, inventoryController.cancelReservation);

// Confirm reservation after successful payment
router.post("/reserve/:reservationId/confirm", authenticate, inventoryController.confirmReservation);

// ========== ADMIN STOCK MANAGEMENT ==========
// Manually adjust stock (add/subtract)
router.post("/adjust/:productId", authenticate, authorizeAdmin, inventoryController.adjustStock);

// Restock product (add inventory)
router.post("/restock/:productId", authenticate, authorizeAdmin, inventoryController.restockProduct);

// Process return (add back to stock)
router.post("/return/:productId", authenticate, authorizeAdmin, inventoryController.processReturn);

// Update stock thresholds (low stock alert, reorder point)
router.patch("/threshold/:productId", authenticate, authorizeAdmin, inventoryController.updateStockThreshold);

// ========== STOCK HISTORY & AUDIT ==========
// Get stock movement history for a product
router.get("/history/:productId", authenticate, authorizeAdmin, inventoryController.getStockHistory);

// Get all reservations (admin)
router.get("/reservations", authenticate, authorizeAdmin, inventoryController.getAllReservations);

// Get expired reservations
router.get("/reservations/expired", authenticate, authorizeAdmin, inventoryController.getExpiredReservations);

// ========== CACHE MANAGEMENT ==========
// Sync stock cache with database (admin only)
router.post("/sync-cache", authenticate, authorizeAdmin, inventoryController.syncStockCache);

// Force refresh cache for specific product
router.post("/cache/refresh/:productId", authenticate, authorizeAdmin, inventoryController.refreshProductCache);

// Clear all stock cache
router.delete("/cache", authenticate, authorizeAdmin, inventoryController.clearStockCache);

// ========== REPORTS ==========
// Get inventory valuation report
router.get("/reports/valuation", authenticate, authorizeAdmin, inventoryController.getInventoryValuation);

// Get stock movement report (date range)
router.get("/reports/movements", authenticate, authorizeAdmin, inventoryController.getStockMovementReport);

// Get products needing restock
router.get("/reports/restock-needed", authenticate, authorizeAdmin, inventoryController.getRestockNeeded);

module.exports = router;