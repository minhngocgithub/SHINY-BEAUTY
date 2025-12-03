
import { defineStore } from 'pinia';
import { getDashboardAnalytics } from '../../service/admin.service';

export const useAdminStore = defineStore('admin', {
    state: () => ({
        // Dashboard Statistics
        dashboardStats: {
            revenue: {
                today: 0,
                week: 0,
                month: 0,
                year: 0,
                trend: {
                    daily: 0
                }
            },
            orders: {
                total: 0,
                pending: 0,
                confirmed: 0,
                preparing: 0,
                in_transit: 0,
                out_for_delivery: 0,
                delivered: 0,
                cancelled: 0
            },
            users: {
                total: 0,
                online: 0,
                newToday: 0
            },
            products: {
                total: 0,
                lowStock: 0,
                outOfStock: 0,
                featured: 0
            }
        },

        // Recent Activity
        recentOrders: [],

        // Alerts
        alerts: {
            lowStock: [],
            pendingOrders: 0
        },

        // UI State
        loading: false,
        error: null,
        lastUpdate: null
    }),

    getters: {
        /**
         * Get pending orders count
         */
        pendingOrdersCount: (state) => state.dashboardStats.orders.pending,

        /**
         * Get low stock products count
         */
        lowStockCount: (state) => state.alerts.lowStock.length,

        /**
         * Get total revenue for current month
         */
        totalRevenue: (state) => state.dashboardStats.revenue.month,

        /**
         * Get revenue growth percentage
         */
        revenueGrowth: (state) => state.dashboardStats.revenue.trend.daily,

        /**
         * Check if data is fresh (less than 1 minute old)
         */
        isDataFresh: (state) => {
            if (!state.lastUpdate) return false;
            const now = new Date();
            const diff = now - new Date(state.lastUpdate);
            return diff < 60000; // 1 minute
        },

        /**
         * Get total orders count
         */
        totalOrders: (state) => state.dashboardStats.orders.total,

        /**
         * Get total users count
         */
        totalUsers: (state) => state.dashboardStats.users.total
    },

    actions: {
        /**
         * Fetch initial dashboard statistics from API
         */
        async fetchDashboardStats() {
            try {
                this.loading = true;
                this.error = null;

                const response = await getDashboardAnalytics();

                if (response.data.success) {
                    this.updateDashboardStats(response.data.data);
                    this.lastUpdate = new Date();
                }
            } catch (error) {
                this.error = error.message || 'Failed to fetch dashboard stats';
                console.error('[AdminStore] Fetch dashboard stats error:', error);
            } finally {
                this.loading = false;
            }
        },

        /**
         * Update dashboard stats (from API or Socket.IO)
         * @param {Object} data - Dashboard data from server
         */
        updateDashboardStats(data) {
            if (!data) return;

            // Update overview stats
            if (data.overview) {
                if (data.overview.revenue) {
                    this.dashboardStats.revenue = {
                        ...this.dashboardStats.revenue,
                        ...data.overview.revenue
                    };
                }

                if (data.overview.orders) {
                    this.dashboardStats.orders = {
                        ...this.dashboardStats.orders,
                        ...data.overview.orders
                    };
                }

                if (data.overview.users) {
                    this.dashboardStats.users = {
                        ...this.dashboardStats.users,
                        ...data.overview.users
                    };
                }

                if (data.overview.products) {
                    this.dashboardStats.products = {
                        ...this.dashboardStats.products,
                        ...data.overview.products
                    };
                }
            }

            // Update recent orders
            if (data.recentOrders) {
                this.recentOrders = data.recentOrders;
            }

            // Update alerts
            if (data.alerts) {
                this.alerts = {
                    ...this.alerts,
                    ...data.alerts
                };
            }

            this.lastUpdate = new Date();
            console.log('[AdminStore] Dashboard stats updated');
        },

        /**
         * Add new order to recent list (from Socket.IO)
         * @param {Object} order - New order object
         */
        addRecentOrder(order) {
            // Add to the beginning of array
            this.recentOrders.unshift(order);

            // Keep only last 10 orders
            if (this.recentOrders.length > 10) {
                this.recentOrders.pop();
            }

            // Increment counts
            this.dashboardStats.orders.total += 1;
            this.dashboardStats.orders.pending += 1;
            this.alerts.pendingOrders += 1;

            console.log('[AdminStore] New order added to recent list:', order._id);
        },

        /**
         * Update existing order in recent list
         * @param {Object} updatedOrder - Updated order object
         */
        updateOrder(updatedOrder) {
            const index = this.recentOrders.findIndex(
                order => order._id === updatedOrder._id
            );

            if (index !== -1) {
                this.recentOrders[index] = updatedOrder;
                console.log('[AdminStore] Order updated in recent list:', updatedOrder._id);
            }
        },

        /**
         * Update real-time metrics
         * @param {Object} metrics - Metrics to update
         */
        updateRealtimeMetrics(metrics) {
            if (metrics.activeUsers !== undefined) {
                this.dashboardStats.users.online = metrics.activeUsers;
            }

            if (metrics.revenuePerHour !== undefined) {
                // You can add this field to state if needed
                console.log('[AdminStore] Revenue per hour:', metrics.revenuePerHour);
            }

            if (metrics.ordersPerHour !== undefined) {
                console.log('[AdminStore] Orders per hour:', metrics.ordersPerHour);
            }
        },

        /**
         * Increment user count
         */
        incrementUserCount() {
            this.dashboardStats.users.total += 1;
            this.dashboardStats.users.newToday += 1;
        },

        /**
         * Decrement user count
         */
        decrementUserCount() {
            this.dashboardStats.users.total = Math.max(0, this.dashboardStats.users.total - 1);
        },

        /**
         * Increment product count
         */
        incrementProductCount() {
            this.dashboardStats.products.total += 1;
        },

        /**
         * Decrement product count
         */
        decrementProductCount() {
            this.dashboardStats.products.total = Math.max(0, this.dashboardStats.products.total - 1);
        },

        /**
         * Update product stock alerts
         */
        updateStockAlert(product, alertType) {
            if (alertType === 'low_stock') {
                if (!this.alerts.lowStock.find(p => p._id === product._id)) {
                    this.alerts.lowStock.push(product);
                }
            } else if (alertType === 'out_of_stock') {
                this.dashboardStats.products.outOfStock += 1;
            } else if (alertType === 'in_stock') {
                // Remove from low stock
                this.alerts.lowStock = this.alerts.lowStock.filter(p => p._id !== product._id);
                this.dashboardStats.products.outOfStock = Math.max(0, this.dashboardStats.products.outOfStock - 1);
            }
        },

        /**
         * Update revenue
         */
        updateRevenue(period, amount) {
            if (period === 'today') {
                this.dashboardStats.revenue.today = amount;
            } else if (period === 'week') {
                this.dashboardStats.revenue.week = amount;
            } else if (period === 'month') {
                this.dashboardStats.revenue.month = amount;
            } else if (period === 'year') {
                this.dashboardStats.revenue.year = amount;
            }
        },

        /**
         * Increment revenue
         */
        incrementRevenue(amount) {
            this.dashboardStats.revenue.today += amount;
            this.dashboardStats.revenue.week += amount;
            this.dashboardStats.revenue.month += amount;
            this.dashboardStats.revenue.year += amount;
        },

        /**
         * Reset store to initial state
         */
        resetStore() {
            this.dashboardStats = {
                revenue: {
                    today: 0,
                    week: 0,
                    month: 0,
                    year: 0,
                    trend: { daily: 0 }
                },
                orders: {
                    total: 0,
                    pending: 0,
                    confirmed: 0,
                    preparing: 0,
                    in_transit: 0,
                    out_for_delivery: 0,
                    delivered: 0,
                    cancelled: 0
                },
                users: {
                    total: 0,
                    online: 0,
                    newToday: 0
                },
                products: {
                    total: 0,
                    lowStock: 0,
                    outOfStock: 0,
                    featured: 0
                }
            };
            this.recentOrders = [];
            this.alerts = {
                lowStock: [],
                pendingOrders: 0
            };
            this.loading = false;
            this.error = null;
            this.lastUpdate = null;

            console.log('[AdminStore] Store reset to initial state');
        }
    }
});
