const logger = require("../config/logger")
const InventoryService = require("../services/inventory.service")
const { asyncHandler, AppError } = require("../middleware/errorHandler.middleware")

const getInventoryAnalytics = asyncHandler(async (req, res) => {
  const analytics = await InventoryService.getInventoryAnalytics()
  res.status(200).json({
    success: true,
    data: analytics,
  })
})

const getStockLevel = asyncHandler(async (req, res) => {
  const { productId } = req.params

  const stock = await InventoryService.getStockLevel(productId)

  res.status(200).json({
    success: true,
    productId,
    stock,
  })
})

const syncStockCache = asyncHandler(async (req, res) => {
  if (req.user?.role !== "admin") {
    throw new AppError("Unauthorized", 403)
  }

  await InventoryService.syncStockCache()

  logger.info("Stock cache sync initiated by admin", {
    userId: req.user._id,
  })

  res.status(200).json({
    success: true,
    message: "Stock cache synced successfully",
  })
})

module.exports = {
  getInventoryAnalytics,
  getStockLevel,
  syncStockCache,
}
