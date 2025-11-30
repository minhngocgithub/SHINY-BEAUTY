const express = require('express');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware')
const inventoryController = require('../controller/inventoryController');

const router = express.Router();

router.get("/analytics", authenticate, authorizeAdmin, inventoryController.getInventoryAnalytics)
router.get("/stock/:productId", inventoryController.getStockLevel)
router.post("/sync-cache", authenticate, authorizeAdmin, inventoryController.syncStockCache)

module.exports = router