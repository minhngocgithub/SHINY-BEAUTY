
const Order = require('../models/order.models');
const User = require('../models/user.models');
const Product = require('../models/product.models');
const redisService = require('./redis.service');
const logger = require('../config/logger');

class AdminDashboardService {
    static async getDashboardStats(forceRefresh = false) {
        const cacheKey = 'admin:dashboard:stats';
        const cacheTTL = 30;
        if (!forceRefresh) {
            const cached = await redisService.get(cacheKey);
            if (cached) {
                logger.debug('Dashboard stats from cache');
                return cached;
            }
        }

        try {
            const [
                revenueStats,
                orderStats,
                userStats,
                productStats,
                recentOrders,
                lowStockProducts
            ] = await Promise.all([
                this.getRevenueStats(),
                this.getOrderStats(),
                this.getUserStats(),
                this.getProductStats(),
                this.getRecentOrders(10),
                this.getLowStockProducts()
            ]);

            const dashboardData = {
                overview: {
                    revenue: revenueStats,
                    orders: orderStats,
                    users: userStats,
                    products: productStats
                },
                recentOrders,
                alerts: {
                    lowStock: lowStockProducts,
                    pendingOrders: orderStats.pending
                },
                timestamp: new Date()
            };

            // Cache for 30 seconds
            await redisService.set(cacheKey, dashboardData, cacheTTL);

            logger.debug('Dashboard stats calculated fresh');
            return dashboardData;

        } catch (error) {
            logger.error('Dashboard stats calculation error', {
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    /**
     * Get revenue statistics with trends
     * @returns {Object} Revenue data
     */
    static async getRevenueStats() {
        const now = new Date();
        const startOfToday = new Date(now.setHours(0, 0, 0, 0));
        const startOfWeek = new Date(now.setDate(now.getDate() - 7));
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        // Calculate revenue for different periods
        const [todayRevenue, weekRevenue, monthRevenue, yearRevenue] = await Promise.all([
            this.calculateRevenue({ createdAt: { $gte: startOfToday } }),
            this.calculateRevenue({ createdAt: { $gte: startOfWeek } }),
            this.calculateRevenue({ createdAt: { $gte: startOfMonth } }),
            this.calculateRevenue({ createdAt: { $gte: startOfYear } })
        ]);

        // Calculate daily trend (compare with yesterday)
        const yesterdayRevenue = await this.calculateRevenue({
            createdAt: {
                $gte: new Date(startOfToday.getTime() - 86400000),
                $lt: startOfToday
            }
        });

        const dailyTrend = yesterdayRevenue > 0
            ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(2)
            : 0;

        return {
            today: parseFloat(todayRevenue.toFixed(2)),
            week: parseFloat(weekRevenue.toFixed(2)),
            month: parseFloat(monthRevenue.toFixed(2)),
            year: parseFloat(yearRevenue.toFixed(2)),
            trend: {
                daily: parseFloat(dailyTrend)
            }
        };
    }

    /**
     * Calculate total revenue for given query
     * @param {Object} query - MongoDB query
     * @returns {number} Total revenue
     */
    static async calculateRevenue(query) {
        const result = await Order.aggregate([
            {
                $match: {
                    ...query,
                    isPaid: true // Only count paid orders
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalPrice' }
                }
            }
        ]);

        return result.length > 0 ? result[0].total : 0;
    }

    /**
     * Get order statistics grouped by status
     * @returns {Object} Order counts by status
     */
    static async getOrderStats() {
        const orders = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    revenue: { $sum: '$totalPrice' }
                }
            }
        ]);

        const stats = {
            total: 0,
            pending: 0,
            confirmed: 0,
            preparing: 0,
            in_transit: 0,
            out_for_delivery: 0,
            delivered: 0,
            cancelled: 0
        };

        orders.forEach(order => {
            const status = order._id.toLowerCase();
            stats[status] = order.count;
            stats.total += order.count;
        });

        return stats;
    }

    /**
     * Get user statistics
     * @returns {Object} User counts
     */
    static async getUserStats() {
        const now = new Date();
        const startOfToday = new Date(now.setHours(0, 0, 0, 0));

        const [totalUsers, newTodayUsers] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ createdAt: { $gte: startOfToday } })
        ]);

        // Active users (placeholder - implement session tracking if needed)
        const activeUsers = 0;

        return {
            total: totalUsers,
            newToday: newTodayUsers,
            online: activeUsers
        };
    }

    /**
     * Get product statistics
     * @returns {Object} Product counts
     */
    static async getProductStats() {
        const [total, lowStock, outOfStock, featured] = await Promise.all([
            Product.countDocuments(),
            Product.countDocuments({ countInStock: { $gt: 0, $lte: 10 } }),
            Product.countDocuments({ countInStock: 0 }),
            Product.countDocuments({ isFeatured: true })
        ]);

        return {
            total,
            lowStock,
            outOfStock,
            featured
        };
    }

    /**
     * Get recent orders
     * @param {number} limit - Number of orders to fetch
     * @returns {Array} Recent orders
     */
    static async getRecentOrders(limit = 10) {
        return await Order.find()
            .populate('user', 'fullName email')
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('_id trackingNumber status totalPrice createdAt shippingAddress isPaid')
            .lean();
    }

    /**
     * Get low stock products
     * @returns {Array} Products with low stock
     */
    static async getLowStockProducts() {
        return await Product.find({
            countInStock: { $gt: 0, $lte: 10 },
            isAvailable: true
        })
            .select('productName countInStock images')
            .sort({ countInStock: 1 })
            .limit(10)
            .lean();
    }

    /**
     * Invalidate dashboard cache
     * Call this when data changes that affect dashboard
     */
    static async invalidateCache() {
        await redisService.del('admin:dashboard:stats');
        logger.info('Dashboard cache invalidated');
    }
}

module.exports = AdminDashboardService;
