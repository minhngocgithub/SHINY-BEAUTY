const logger = require("../config/logger")
const AnalyticsService = require("../services/analytics.service")
const { asyncHandler, AppError } = require("../middleware/errorHandler.middleware")

/**
 * Get comprehensive dashboard statistics
 * GET /api/v1/admin/analytics/dashboard
 */
const getDashboardStats = asyncHandler(async (req, res) => {
    const {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate = new Date().toISOString(),
        useCache = true
    } = req.query

    // Generate cache key
    const cacheKey = `dashboard:${startDate}:${endDate}`

    let stats = null

    // Check cache if enabled
    if (useCache === "true" || useCache === true) {
        stats = await AnalyticsService.getCachedAnalytics(cacheKey)
    }

    // If no cache, fetch fresh data
    if (!stats) {
        const [
            dashboardStats,
            orderAnalytics,
            productAnalytics,
            userAnalytics,
            revenueTrends,
            realTimeStats
        ] = await Promise.all([
            AnalyticsService.getDashboardStats(startDate, endDate),
            AnalyticsService.getOrderAnalytics(startDate, endDate),
            AnalyticsService.getProductAnalytics(10),
            AnalyticsService.getUserAnalytics(startDate, endDate),
            AnalyticsService.getRevenueTrends(30),
            AnalyticsService.getRealTimeStats()
        ])

        stats = {
            overview: dashboardStats.overview,
            realTime: realTimeStats,
            orders: {
                summary: orderAnalytics.summary[0] || {},
                byStatus: orderAnalytics.byStatus,
                byPaymentMethod: orderAnalytics.byPaymentMethod,
                byPaymentStatus: orderAnalytics.byPaymentStatus
            },
            products: productAnalytics,
            users: userAnalytics,
            trends: {
                revenue: revenueTrends
            }
        }

        // Cache for 1 hour (3600 seconds)
        if (useCache === "true" || useCache === true) {
            await AnalyticsService.cacheAnalytics(cacheKey, stats, 3600)
        }
    }

    res.status(200).json({
        success: true,
        cached: stats ? true : false,
        data: stats
    })
})

/**
 * Get order analytics
 * GET /api/v1/admin/analytics/orders
 */
const getOrderAnalytics = asyncHandler(async (req, res) => {
    const {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate = new Date().toISOString()
    } = req.query

    const analytics = await AnalyticsService.getOrderAnalytics(startDate, endDate)

    res.status(200).json({
        success: true,
        data: analytics
    })
})

/**
 * Get daily sales data for charts
 * GET /api/v1/admin/analytics/daily-sales
 */
const getDailySalesData = asyncHandler(async (req, res) => {
    const {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate = new Date().toISOString()
    } = req.query

    const dailyData = await AnalyticsService.getDailySalesData(startDate, endDate)

    res.status(200).json({
        success: true,
        data: dailyData
    })
})

/**
 * Get revenue trends
 * GET /api/v1/admin/analytics/revenue-trends
 */
const getRevenueTrends = asyncHandler(async (req, res) => {
    const { days = 30 } = req.query

    const trends = await AnalyticsService.getRevenueTrends(parseInt(days))

    res.status(200).json({
        success: true,
        data: trends
    })
})

/**
 * Get product analytics
 * GET /api/v1/admin/analytics/products
 */
const getProductAnalytics = asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query

    const analytics = await AnalyticsService.getProductAnalytics(parseInt(limit))

    res.status(200).json({
        success: true,
        data: analytics
    })
})

/**
 * Get user analytics
 * GET /api/v1/admin/analytics/users
 */
const getUserAnalytics = asyncHandler(async (req, res) => {
    const {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate = new Date().toISOString()
    } = req.query

    const analytics = await AnalyticsService.getUserAnalytics(startDate, endDate)

    res.status(200).json({
        success: true,
        data: analytics
    })
})

/**
 * Get top selling products
 * GET /api/v1/admin/analytics/top-products
 */
const getTopProducts = asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query

    const topProducts = await AnalyticsService.getTopProducts(parseInt(limit))

    res.status(200).json({
        success: true,
        data: topProducts
    })
})

/**
 * Get low stock products
 * GET /api/v1/admin/analytics/low-stock
 */
const getLowStockProducts = asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query

    const lowStockProducts = await AnalyticsService.getLowStockProducts(parseInt(limit))

    res.status(200).json({
        success: true,
        data: lowStockProducts
    })
})

/**
 * Get category statistics
 * GET /api/v1/admin/analytics/categories
 */
const getCategoryStats = asyncHandler(async (req, res) => {
    const stats = await AnalyticsService.getCategoryStats()

    res.status(200).json({
        success: true,
        data: stats
    })
})

/**
 * Get top customers
 * GET /api/v1/admin/analytics/top-customers
 */
const getTopCustomers = asyncHandler(async (req, res) => {
    const {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate = new Date().toISOString(),
        limit = 10
    } = req.query

    const topCustomers = await AnalyticsService.getTopCustomers(
        startDate,
        endDate,
        parseInt(limit)
    )

    res.status(200).json({
        success: true,
        data: topCustomers
    })
})

/**
 * Get user growth over time
 * GET /api/v1/admin/analytics/user-growth
 */
const getUserGrowth = asyncHandler(async (req, res) => {
    const { days = 30 } = req.query

    const growth = await AnalyticsService.getUserGrowth(parseInt(days))

    res.status(200).json({
        success: true,
        data: growth
    })
})

/**
 * Get real-time statistics (no cache)
 * GET /api/v1/admin/analytics/realtime
 */
const getRealTimeStats = asyncHandler(async (req, res) => {
    const stats = await AnalyticsService.getRealTimeStats()

    res.status(200).json({
        success: true,
        data: stats
    })
})

/**
 * Invalidate analytics cache
 * DELETE /api/v1/admin/analytics/cache
 */
const invalidateCache = asyncHandler(async (req, res) => {
    const { pattern = "*" } = req.query

    await AnalyticsService.invalidateCache(pattern)

    res.status(200).json({
        success: true,
        message: "Cache invalidated successfully"
    })
})

/**
 * Get cache statistics
 * GET /api/v1/admin/analytics/cache-stats
 */
const getCacheStats = asyncHandler(async (req, res) => {
    const { redisClient } = require("../config/redis")

    const keys = await redisClient.keys("analytics:*")
    const info = await redisClient.info("memory")

    res.status(200).json({
        success: true,
        data: {
            cachedKeys: keys.length,
            keys: keys,
            memoryInfo: info
        }
    })
})

module.exports = {
    // Main dashboard
    getDashboardStats,

    // Order analytics
    getOrderAnalytics,
    getDailySalesData,
    getRevenueTrends,

    // Product analytics
    getProductAnalytics,
    getTopProducts,
    getLowStockProducts,
    getCategoryStats,

    // User analytics
    getUserAnalytics,
    getTopCustomers,
    getUserGrowth,

    // Real-time & cache
    getRealTimeStats,
    invalidateCache,
    getCacheStats
}