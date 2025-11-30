const mongoose = require("mongoose")
const { redisClient } = require("../config/redis")
const logger = require("../config/logger")

class AnalyticsService {
    /**
     * Get comprehensive dashboard statistics
     */
    static async getDashboardStats(startDate, endDate) {
        try {
            const Order = mongoose.model("Order")
            const Product = mongoose.model("Product")
            const User = mongoose.model("User")

            // Parallel execution for better performance
            const [totalUsers, totalProducts, salesData, ordersByStatus, topProducts] = await Promise.all([
                User.countDocuments(),
                Product.countDocuments(),
                this.getSalesData(startDate, endDate),
                this.getOrdersByStatus(startDate, endDate),
                this.getTopProducts(10)
            ])

            return {
                overview: {
                    totalUsers,
                    totalProducts,
                    totalOrders: salesData.totalOrders,
                    totalRevenue: salesData.totalRevenue,
                    averageOrderValue: salesData.averageOrderValue
                },
                salesData,
                ordersByStatus,
                topProducts
            }
        } catch (error) {
            logger.error("Failed to get dashboard stats", { error: error.message })
            throw error
        }
    }

    /**
     * Get sales data summary
     */
    static async getSalesData(startDate, endDate) {
        try {
            const Order = mongoose.model("Order")

            const result = await Order.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(startDate),
                            $lte: new Date(endDate)
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        totalRevenue: { $sum: "$totalAmount" },
                        averageOrderValue: { $avg: "$totalAmount" },
                        totalItems: { $sum: { $size: "$orderItems" } }
                    }
                }
            ])

            return result[0] || {
                totalOrders: 0,
                totalRevenue: 0,
                averageOrderValue: 0,
                totalItems: 0
            }
        } catch (error) {
            logger.error("Failed to get sales data", { error: error.message })
            throw error
        }
    }

    /**
     * Get order analytics with detailed breakdown
     */
    static async getOrderAnalytics(startDate, endDate) {
        try {
            const Order = mongoose.model("Order")

            const analytics = await Order.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(startDate),
                            $lte: new Date(endDate)
                        }
                    }
                },
                {
                    $facet: {
                        summary: [
                            {
                                $group: {
                                    _id: null,
                                    totalOrders: { $sum: 1 },
                                    totalRevenue: { $sum: "$totalAmount" },
                                    averageOrderValue: { $avg: "$totalAmount" },
                                    totalItems: { $sum: { $size: "$orderItems" } }
                                }
                            }
                        ],
                        byStatus: [
                            {
                                $group: {
                                    _id: "$status",
                                    count: { $sum: 1 },
                                    revenue: { $sum: "$totalAmount" }
                                }
                            },
                            { $sort: { count: -1 } }
                        ],
                        byPaymentMethod: [
                            {
                                $group: {
                                    _id: "$paymentMethod",
                                    count: { $sum: 1 },
                                    revenue: { $sum: "$totalAmount" }
                                }
                            },
                            { $sort: { count: -1 } }
                        ],
                        byPaymentStatus: [
                            {
                                $group: {
                                    _id: "$isPaid",
                                    count: { $sum: 1 },
                                    revenue: { $sum: "$totalAmount" }
                                }
                            }
                        ]
                    }
                }
            ])

            return analytics[0] || {
                summary: [],
                byStatus: [],
                byPaymentMethod: [],
                byPaymentStatus: []
            }
        } catch (error) {
            logger.error("Failed to get order analytics", { error: error.message })
            throw error
        }
    }

    /**
     * Get orders grouped by status
     */
    static async getOrdersByStatus(startDate, endDate) {
        try {
            const Order = mongoose.model("Order")

            const result = await Order.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(startDate),
                            $lte: new Date(endDate)
                        }
                    }
                },
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 },
                        revenue: { $sum: "$totalAmount" }
                    }
                },
                { $sort: { count: -1 } }
            ])

            return result
        } catch (error) {
            logger.error("Failed to get orders by status", { error: error.message })
            throw error
        }
    }

    /**
     * Get daily sales data for charts
     */
    static async getDailySalesData(startDate, endDate) {
        try {
            const Order = mongoose.model("Order")

            const dailyData = await Order.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(startDate),
                            $lte: new Date(endDate)
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$createdAt"
                            }
                        },
                        sales: { $sum: 1 },
                        revenue: { $sum: "$totalAmount" },
                        averageOrderValue: { $avg: "$totalAmount" }
                    }
                },
                { $sort: { _id: 1 } }
            ])

            // Fill in missing dates with zero values
            const dateArray = this.getDateRange(new Date(startDate), new Date(endDate))

            return dateArray.map(date => {
                const foundData = dailyData.find(item => item._id === date)
                return {
                    date,
                    sales: foundData?.sales || 0,
                    revenue: foundData?.revenue || 0,
                    averageOrderValue: foundData?.averageOrderValue || 0
                }
            })
        } catch (error) {
            logger.error("Failed to get daily sales data", { error: error.message })
            throw error
        }
    }

    /**
     * Get revenue trends (alias for getDailySalesData)
     */
    static async getRevenueTrends(days = 30) {
        try {
            const endDate = new Date()
            const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)

            return await this.getDailySalesData(startDate, endDate)
        } catch (error) {
            logger.error("Failed to get revenue trends", { error: error.message })
            throw error
        }
    }

    /**
     * Get product analytics
     */
    static async getProductAnalytics(limit = 10) {
        try {
            const Product = mongoose.model("Product")

            const [topProducts, lowStockProducts, categoryStats] = await Promise.all([
                this.getTopProducts(limit),
                this.getLowStockProducts(limit),
                this.getCategoryStats()
            ])

            return {
                topProducts,
                lowStockProducts,
                categoryStats
            }
        } catch (error) {
            logger.error("Failed to get product analytics", { error: error.message })
            throw error
        }
    }

    /**
     * Get top selling products
     */
    static async getTopProducts(limit = 10) {
        try {
            const Product = mongoose.model("Product")

            const topProducts = await Product.aggregate([
                {
                    $addFields: {
                        revenue: { $multiply: ["$sold", "$price"] }
                    }
                },
                { $sort: { sold: -1 } },
                { $limit: limit },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        sold: 1,
                        price: 1,
                        revenue: 1,
                        countInStock: 1,
                        ratings: 1,
                        image: 1
                    }
                }
            ])

            return topProducts
        } catch (error) {
            logger.error("Failed to get top products", { error: error.message })
            throw error
        }
    }

    /**
     * Get low stock products
     */
    static async getLowStockProducts(limit = 10) {
        try {
            const Product = mongoose.model("Product")

            const lowStockProducts = await Product.find({
                countInStock: { $lt: 20 }
            })
                .select("name countInStock price category image")
                .sort({ countInStock: 1 })
                .limit(limit)

            return lowStockProducts
        } catch (error) {
            logger.error("Failed to get low stock products", { error: error.message })
            throw error
        }
    }

    /**
     * Get category statistics
     */
    static async getCategoryStats() {
        try {
            const Product = mongoose.model("Product")

            const stats = await Product.aggregate([
                {
                    $group: {
                        _id: "$category",
                        productCount: { $sum: 1 },
                        totalRevenue: { $sum: { $multiply: ["$sold", "$price"] } },
                        totalSold: { $sum: "$sold" },
                        averagePrice: { $avg: "$price" }
                    }
                },
                { $sort: { totalRevenue: -1 } }
            ])

            return stats
        } catch (error) {
            logger.error("Failed to get category stats", { error: error.message })
            throw error
        }
    }

    /**
     * Get user analytics
     */
    static async getUserAnalytics(startDate, endDate) {
        try {
            const User = mongoose.model("User")
            const Order = mongoose.model("Order")

            const [newUsers, topCustomers, userGrowth] = await Promise.all([
                this.getNewUsersCount(startDate, endDate),
                this.getTopCustomers(startDate, endDate, 10),
                this.getUserGrowth(30)
            ])

            return {
                newUsers,
                topCustomers,
                userGrowth
            }
        } catch (error) {
            logger.error("Failed to get user analytics", { error: error.message })
            throw error
        }
    }

    /**
     * Get new users count
     */
    static async getNewUsersCount(startDate, endDate) {
        try {
            const User = mongoose.model("User")

            const count = await User.countDocuments({
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            })

            return count
        } catch (error) {
            logger.error("Failed to get new users count", { error: error.message })
            throw error
        }
    }

    /**
     * Get top customers by spending
     */
    static async getTopCustomers(startDate, endDate, limit = 10) {
        try {
            const Order = mongoose.model("Order")

            const topCustomers = await Order.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(startDate),
                            $lte: new Date(endDate)
                        }
                    }
                },
                {
                    $group: {
                        _id: "$user",
                        totalSpent: { $sum: "$totalAmount" },
                        orderCount: { $sum: 1 },
                        averageOrderValue: { $avg: "$totalAmount" }
                    }
                },
                { $sort: { totalSpent: -1 } },
                { $limit: limit },
                {
                    $lookup: {
                        from: "users",
                        localField: "_id",
                        foreignField: "_id",
                        as: "userDetails"
                    }
                },
                { $unwind: "$userDetails" },
                {
                    $project: {
                        userId: "$_id",
                        email: "$userDetails.email",
                        name: "$userDetails.name",
                        avatar: "$userDetails.avatar",
                        totalSpent: 1,
                        orderCount: 1,
                        averageOrderValue: 1
                    }
                }
            ])

            return topCustomers
        } catch (error) {
            logger.error("Failed to get top customers", { error: error.message })
            throw error
        }
    }

    /**
     * Get user growth over time
     */
    static async getUserGrowth(days = 30) {
        try {
            const User = mongoose.model("User")
            const endDate = new Date()
            const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)

            const growth = await User.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startDate }
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$createdAt"
                            }
                        },
                        newUsers: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ])

            // Fill in missing dates
            const dateArray = this.getDateRange(startDate, endDate)

            return dateArray.map(date => {
                const foundData = growth.find(item => item._id === date)
                return {
                    date,
                    newUsers: foundData?.newUsers || 0
                }
            })
        } catch (error) {
            logger.error("Failed to get user growth", { error: error.message })
            throw error
        }
    }

    /**
     * Cache analytics data with TTL
     */
    static async cacheAnalytics(key, data, ttl = 3600) {
        try {
            const cacheKey = `analytics:${key}`
            await redisClient.setex(cacheKey, ttl, JSON.stringify(data))
            logger.info("Analytics cached", { key, ttl })
        } catch (error) {
            logger.error("Failed to cache analytics", { error: error.message })
            // Don't throw - caching failure shouldn't break the request
        }
    }

    /**
     * Get cached analytics data
     */
    static async getCachedAnalytics(key) {
        try {
            const cacheKey = `analytics:${key}`
            const cached = await redisClient.get(cacheKey)

            if (cached) {
                logger.info("Analytics cache hit", { key })
                return JSON.parse(cached)
            }

            logger.info("Analytics cache miss", { key })
            return null
        } catch (error) {
            logger.error("Failed to get cached analytics", { error: error.message })
            return null
        }
    }

    /**
     * Invalidate analytics cache
     */
    static async invalidateCache(pattern = "*") {
        try {
            const keys = await redisClient.keys(`analytics:${pattern}`)
            if (keys.length > 0) {
                await redisClient.del(...keys)
                logger.info("Analytics cache invalidated", { pattern, keysCount: keys.length })
            }
        } catch (error) {
            logger.error("Failed to invalidate analytics cache", { error: error.message })
        }
    }

    /**
     * Helper: Generate date range array
     */
    static getDateRange(startDate, endDate) {
        const dates = []
        const currentDate = new Date(startDate)

        while (currentDate <= endDate) {
            dates.push(currentDate.toISOString().split("T")[0])
            currentDate.setDate(currentDate.getDate() + 1)
        }

        return dates
    }

    /**
     * Get real-time analytics (no cache)
     */
    static async getRealTimeStats() {
        try {
            const Order = mongoose.model("Order")
            const now = new Date()
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

            const [todayOrders, todayRevenue, pendingOrders] = await Promise.all([
                Order.countDocuments({ createdAt: { $gte: today } }),
                Order.aggregate([
                    { $match: { createdAt: { $gte: today } } },
                    { $group: { _id: null, total: { $sum: "$totalAmount" } } }
                ]),
                Order.countDocuments({ status: "pending" })
            ])

            return {
                todayOrders,
                todayRevenue: todayRevenue[0]?.total || 0,
                pendingOrders,
                timestamp: now
            }
        } catch (error) {
            logger.error("Failed to get real-time stats", { error: error.message })
            throw error
        }
    }
}

module.exports = AnalyticsService