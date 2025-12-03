import { defineStore } from 'pinia'
import { getAllOrdersAdmin, getPendingOrders } from '../../service/admin.service'

/**
 * Admin Order Store
 * Manages order data and actions for admin
 */
export const useAdminOrderStore = defineStore('adminOrder', {
    state: () => ({
        allOrders: [],
        pendingOrders: [],
        recentOrders: [],

        currentPage: 1,
        totalPages: 1,
        totalOrders: 0,
        limit: 20,

        filters: {
            status: '',
            paymentStatus: '',
            search: '',
            dateFrom: null,
            dateTo: null
        },

        // Selected order
        selectedOrder: null,

        // UI State
        loading: false,
        error: null,
        lastUpdate: null
    }),

    getters: {

        pendingCount: (state) => state.pendingOrders.length,
        ordersByStatus: (state) => (status) => {
            return state.allOrders.filter((order) => order.status === status)
        },

        latestOrders: (state) => state.recentOrders.slice(0, 10),

        hasPendingOrders: (state) => state.pendingOrders.length > 0,

        ordersNeedingAction: (state) => {
            return state.allOrders.filter(
                (order) => order.status === 'PENDING' || (order.isPaid === false && order.paymentMethod !== 'COD')
            )
        }
    },

    actions: {

        async fetchAllOrders(params = {}) {
            try {
                this.loading = true
                this.error = null

                const queryParams = {
                    page: this.currentPage,
                    limit: this.limit,
                    ...this.filters,
                    ...params
                }

                const response = await getAllOrdersAdmin(queryParams)

                if (response.data.success) {
                    this.allOrders = response.data.data || []
                    this.totalOrders = response.data.pagination?.total || 0
                    this.totalPages = response.data.pagination?.totalPages || 1
                    this.currentPage = response.data.pagination?.page || 1
                    this.lastUpdate = new Date()
                } else {
                    this.error = response.data.message || 'Failed to fetch orders'
                }
            } catch (error) {
                this.error = error.message || 'Failed to fetch orders'
                console.error('[AdminOrderStore] Fetch all orders error:', error)
            } finally {
                this.loading = false
            }
        },

        /**
         * Fetch pending orders
         */
        async fetchPendingOrders() {
            try {
                const response = await getPendingOrders()

                if (response.data.success) {
                    this.pendingOrders = response.data.data || []
                }
            } catch (error) {
                console.error('[AdminOrderStore] Fetch pending orders error:', error)
            }
        },

        /**
         * Add new order (from Socket.IO)
         */
        addNewOrder(order) {
            // Add to recent orders (top)
            this.recentOrders.unshift(order)

            // Keep only last 20
            if (this.recentOrders.length > 20) {
                this.recentOrders.pop()
            }

            // Add to pending if status is PENDING
            if (order.status === 'PENDING') {
                this.pendingOrders.unshift(order)
            }

            // Update total count
            this.totalOrders += 1

            this.lastUpdate = new Date()
        },

        /**
         * Update existing order
         */
        updateOrder(updatedOrder) {
            // Update in all orders
            const allOrderIndex = this.allOrders.findIndex((o) => o._id === updatedOrder._id)
            if (allOrderIndex !== -1) {
                this.allOrders[allOrderIndex] = updatedOrder
            }

            // Update in recent orders
            const recentIndex = this.recentOrders.findIndex((o) => o._id === updatedOrder._id)
            if (recentIndex !== -1) {
                this.recentOrders[recentIndex] = updatedOrder
            }

            // Update pending orders
            const pendingIndex = this.pendingOrders.findIndex((o) => o._id === updatedOrder._id)

            if (updatedOrder.status === 'PENDING') {
                // Add or update in pending
                if (pendingIndex === -1) {
                    this.pendingOrders.unshift(updatedOrder)
                } else {
                    this.pendingOrders[pendingIndex] = updatedOrder
                }
            } else {
                // Remove from pending if status changed
                if (pendingIndex !== -1) {
                    this.pendingOrders.splice(pendingIndex, 1)
                }
            }

            // Update selected order if it's the same
            if (this.selectedOrder?._id === updatedOrder._id) {
                this.selectedOrder = updatedOrder
            }

            this.lastUpdate = new Date()
        },

        /**
         * Remove order
         */
        removeOrder(orderId) {
            this.allOrders = this.allOrders.filter((o) => o._id !== orderId)
            this.recentOrders = this.recentOrders.filter((o) => o._id !== orderId)
            this.pendingOrders = this.pendingOrders.filter((o) => o._id !== orderId)

            if (this.selectedOrder?._id === orderId) {
                this.selectedOrder = null
            }

            this.totalOrders -= 1
        },

        /**
         * Set selected order
         */
        setSelectedOrder(order) {
            this.selectedOrder = order
        },

        /**
         * Clear selected order
         */
        clearSelectedOrder() {
            this.selectedOrder = null
        },

        /**
         * Update filters
         */
        updateFilters(filters) {
            this.filters = {
                ...this.filters,
                ...filters
            }
        },

        /**
         * Clear filters
         */
        clearFilters() {
            this.filters = {
                status: '',
                paymentStatus: '',
                search: '',
                dateFrom: null,
                dateTo: null
            }
        },

        /**
         * Change page
         */
        async changePage(page) {
            this.currentPage = page
            await this.fetchAllOrders()
        },

        /**
         * Refresh orders
         */
        async refresh() {
            await Promise.all([this.fetchAllOrders(), this.fetchPendingOrders()])
        },

        /**
         * Clear all data
         */
        clearData() {
            this.allOrders = []
            this.pendingOrders = []
            this.recentOrders = []
            this.selectedOrder = null
            this.currentPage = 1
            this.totalPages = 1
            this.totalOrders = 0
            this.lastUpdate = null
        }
    }
})
