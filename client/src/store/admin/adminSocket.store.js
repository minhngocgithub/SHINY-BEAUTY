import { defineStore } from 'pinia'
import { io } from 'socket.io-client'
import { useAdminStore } from './admin.store'
import { useAdminOrderStore } from './adminOrder.store'

/**
 * Admin Socket Store
 * Manages Socket.IO connection and events for admin dashboard
 */
export const useAdminSocketStore = defineStore('adminSocket', {
    state: () => ({
        // Socket instances
        socket: null,

        // Connection state
        connected: false,
        connecting: false,
        error: null,

        // Subscription state
        dashboardSubscribed: false,
        ordersSubscribed: false,
        analyticsSubscribed: false,

        // Reconnection
        reconnectAttempts: 0,
        maxReconnectAttempts: 5,

        // Notifications
        notifications: [],
        unreadCount: 0,

        // Sound settings
        soundEnabled: true,
        desktopNotificationsEnabled: false
    }),

    getters: {
        /**
         * Is connected to Socket.IO
         */
        isConnected: (state) => state.connected,

        /**
         * Is subscribing to real-time updates
         */
        isSubscribed: (state) => state.dashboardSubscribed || state.ordersSubscribed || state.analyticsSubscribed,

        /**
         * Socket ID
         */
        socketId: (state) => state.socket?.id || null,

        /**
         * Unread notifications count
         */
        unreadNotificationCount: (state) => state.unreadCount,

        /**
         * Has unread notifications
         */
        hasUnreadNotifications: (state) => state.unreadCount > 0
    },

    actions: {
        /**
         * Connect to admin Socket.IO namespace
         */
        connectAdminSocket(token) {
            if (this.socket?.connected) {
                console.log('[AdminSocket] Already connected')
                return
            }

            try {
                this.connecting = true
                this.error = null

                const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000'

                console.log('[AdminSocket] Connecting to admin namespace:', socketUrl + '/admin')

                // Create socket connection to /admin namespace
                this.socket = io(socketUrl + '/admin', {
                    auth: { token },
                    transports: ['websocket', 'polling'],
                    reconnection: true,
                    reconnectionDelay: 1000,
                    reconnectionDelayMax: 5000,
                    reconnectionAttempts: this.maxReconnectAttempts,
                    autoConnect: true,
                    withCredentials: true
                })

                this.setupSocketListeners()
            } catch (error) {
                this.error = error.message
                console.error('[AdminSocket] Connection error:', error)
            } finally {
                this.connecting = false
            }
        },

        /**
         * Setup Socket.IO event listeners
         */
        setupSocketListeners() {
            if (!this.socket) return

            // Connection events
            this.socket.on('connect', () => {
                console.log('✅ [AdminSocket] Connected:', this.socket.id)
                this.connected = true
                this.connecting = false
                this.reconnectAttempts = 0
                this.error = null

                // Auto-subscribe to dashboard on connect
                this.subscribeToDashboard()
            })

            this.socket.on('disconnect', (reason) => {
                console.log('❌ [AdminSocket] Disconnected:', reason)
                this.connected = false
                this.dashboardSubscribed = false
                this.ordersSubscribed = false
                this.analyticsSubscribed = false

                if (reason === 'io server disconnect') {
                    // Server disconnected, manual reconnect
                    console.log('[AdminSocket] Server disconnected, attempting reconnect...')
                    setTimeout(() => this.socket?.connect(), 1000)
                }
            })

            this.socket.on('connect_error', (error) => {
                console.error('[AdminSocket] Connection error:', error.message)
                console.error('[AdminSocket] Error details:', error)
                this.connecting = false
                this.error = error.message
                this.reconnectAttempts++

                // Check for specific auth errors
                if (error.message.includes('User not found')) {
                    console.error('❌ [AdminSocket] User not found in database. Token may be invalid or user deleted.')
                    this.error = 'Authentication failed: User not found. Please login again.'
                } else if (error.message.includes('Token expired')) {
                    console.error('❌ [AdminSocket] Token expired. Please login again.')
                    this.error = 'Session expired. Please login again.'
                } else if (error.message.includes('Admin access required')) {
                    console.error('❌ [AdminSocket] User is not an admin.')
                    this.error = 'Admin access required.'
                }

                if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                    console.error('[AdminSocket] Max reconnection attempts reached')
                    this.error = 'Failed to connect to admin socket. Please refresh the page.'
                }
            })

            this.socket.on('reconnect', (attemptNumber) => {
                console.log(`🔄 [AdminSocket] Reconnected after ${attemptNumber} attempts`)
                this.reconnectAttempts = 0
            })

            // Dashboard stats events
            this.socket.on('admin:dashboard:initial', (response) => {
                if (response.success) {
                    const adminStore = useAdminStore()
                    adminStore.updateDashboardStats(response.data)
                    this.dashboardSubscribed = true
                    console.log('📊 [AdminSocket] Dashboard initial data received')
                }
            })

            this.socket.on('admin:dashboard:update', (response) => {
                if (response.success) {
                    const adminStore = useAdminStore()
                    adminStore.updateDashboardStats(response.data)
                    console.log('🔄 [AdminSocket] Dashboard updated:', response.updateType || 'scheduled')
                }
            })

            this.socket.on('admin:dashboard:unsubscribed', (response) => {
                if (response.success) {
                    this.dashboardSubscribed = false
                    console.log('✅ [AdminSocket] Dashboard unsubscribed')
                }
            })

            // Order events
            this.socket.on('admin:order:new', (response) => {
                if (response.success) {
                    const adminOrderStore = useAdminOrderStore()
                    const adminStore = useAdminStore()

                    adminOrderStore.addNewOrder(response.data)
                    adminStore.addRecentOrder(response.data)

                    // Show notification
                    this.showNotification('New Order', `Order #${response.data._id} received`, 'order')

                    // Play sound
                    this.playNotificationSound()

                    console.log('[AdminSocket] New order received:', response.data._id)
                }
            })

            this.socket.on('admin:order:updated', (response) => {
                if (response.success) {
                    const adminOrderStore = useAdminOrderStore()
                    adminOrderStore.updateOrder(response.data)
                    console.log('[AdminSocket] Order updated:', response.data._id)
                }
            })

            this.socket.on('admin:order:confirmed', (response) => {
                if (response.success) {
                    const adminOrderStore = useAdminOrderStore()
                    adminOrderStore.updateOrder(response.data)
                    console.log('[AdminSocket] Order confirmed:', response.data._id)
                }
            })

            this.socket.on('admin:order:cancelled', (response) => {
                if (response.success) {
                    const adminOrderStore = useAdminOrderStore()
                    adminOrderStore.updateOrder(response.data)
                    console.log('[AdminSocket] Order cancelled:', response.data._id)
                }
            })

            this.socket.on('admin:orders:pending', (response) => {
                if (response.success) {
                    const adminOrderStore = useAdminOrderStore()
                    adminOrderStore.pendingOrders = response.data
                    console.log('[AdminSocket] Pending orders:', response.count)
                }
            })

            // User events
            this.socket.on('admin:user:new', (response) => {
                if (response.success) {
                    const adminStore = useAdminStore()

                    // Update user count
                    adminStore.dashboardStats.users.total += 1
                    adminStore.dashboardStats.users.newToday += 1

                    // Show notification
                    this.showNotification(
                        'New User Registered',
                        `${response.data.name || response.data.email} just joined!`,
                        'user',
                        { userId: response.data._id }
                    )

                    // Play sound
                    this.playNotificationSound()

                    console.log('[AdminSocket] New user registered:', response.data._id)
                }
            })

            this.socket.on('admin:user:updated', (response) => {
                if (response.success) {
                    console.log('[AdminSocket] User updated:', response.data._id)
                }
            })

            this.socket.on('admin:user:deleted', (response) => {
                if (response.success) {
                    const adminStore = useAdminStore()
                    adminStore.dashboardStats.users.total = Math.max(0, adminStore.dashboardStats.users.total - 1)
                    console.log('[AdminSocket] User deleted:', response.data._id)
                }
            })

            // Product events
            this.socket.on('admin:product:new', (response) => {
                if (response.success) {
                    const adminStore = useAdminStore()

                    // Update product count
                    adminStore.dashboardStats.products.total += 1

                    // Show notification
                    this.showNotification(
                        'New Product Added',
                        `${response.data.name} has been added to inventory`,
                        'product',
                        { productId: response.data._id }
                    )

                    console.log('[AdminSocket] New product added:', response.data._id)
                }
            })

            this.socket.on('admin:product:updated', (response) => {
                if (response.success) {
                    console.log('[AdminSocket] Product updated:', response.data._id)
                }
            })

            this.socket.on('admin:product:deleted', (response) => {
                if (response.success) {
                    const adminStore = useAdminStore()
                    adminStore.dashboardStats.products.total = Math.max(0, adminStore.dashboardStats.products.total - 1)
                    console.log('[AdminSocket] Product deleted:', response.data._id)
                }
            })

            this.socket.on('admin:product:low_stock', (response) => {
                if (response.success) {
                    const adminStore = useAdminStore()

                    // Update low stock count
                    if (!adminStore.alerts.lowStock.find(p => p._id === response.data._id)) {
                        adminStore.alerts.lowStock.push(response.data)
                    }

                    // Show notification
                    this.showNotification(
                        'Low Stock Alert',
                        `${response.data.name} is running low (${response.data.stock} left)`,
                        'inventory',
                        { productId: response.data._id }
                    )

                    // Play sound
                    this.playNotificationSound()

                    console.log('[AdminSocket] Low stock alert:', response.data.name)
                }
            })

            this.socket.on('admin:product:out_of_stock', (response) => {
                if (response.success) {
                    const adminStore = useAdminStore()

                    // Update out of stock count
                    adminStore.dashboardStats.products.outOfStock += 1

                    // Show notification
                    this.showNotification(
                        'Out of Stock',
                        `${response.data.name} is now out of stock!`,
                        'inventory',
                        { productId: response.data._id }
                    )

                    // Play sound
                    this.playNotificationSound()

                    console.log('[AdminSocket] Out of stock:', response.data.name)
                }
            })

            // Revenue events
            this.socket.on('admin:revenue:milestone', (response) => {
                if (response.success) {
                    const adminStore = useAdminStore()

                    // Update revenue
                    if (response.data.period === 'today') {
                        adminStore.dashboardStats.revenue.today = response.data.amount
                    } else if (response.data.period === 'month') {
                        adminStore.dashboardStats.revenue.month = response.data.amount
                    }

                    // Show notification
                    this.showNotification(
                        'Revenue Milestone! 🎉',
                        `${response.data.period} revenue reached $${response.data.amount.toLocaleString()}`,
                        'revenue'
                    )

                    // Play sound
                    this.playNotificationSound()

                    console.log('[AdminSocket] Revenue milestone:', response.data)
                }
            })

            this.socket.on('admin:revenue:update', (response) => {
                if (response.success) {
                    const adminStore = useAdminStore()

                    // Update revenue stats
                    if (response.data.today !== undefined) {
                        adminStore.dashboardStats.revenue.today = response.data.today
                    }
                    if (response.data.week !== undefined) {
                        adminStore.dashboardStats.revenue.week = response.data.week
                    }
                    if (response.data.month !== undefined) {
                        adminStore.dashboardStats.revenue.month = response.data.month
                    }

                    console.log('[AdminSocket] Revenue updated')
                }
            })

            // Review events
            this.socket.on('admin:review:new', (response) => {
                if (response.success) {
                    // Show notification
                    this.showNotification(
                        'New Review',
                        `${response.data.user?.name || 'A customer'} left a ${response.data.rating}★ review`,
                        'review',
                        { reviewId: response.data._id }
                    )

                    console.log('[AdminSocket] New review:', response.data._id)
                }
            })

            this.socket.on('admin:review:reported', (response) => {
                if (response.success) {
                    // Show notification
                    this.showNotification(
                        'Review Reported',
                        `A review has been reported for moderation`,
                        'review',
                        { reviewId: response.data._id }
                    )

                    // Play sound
                    this.playNotificationSound()

                    console.log('[AdminSocket] Review reported:', response.data._id)
                }
            })

            // Analytics events (TODO: Implement when analytics feature is ready)
            this.socket.on('admin:analytics:initial', (response) => {
                if (response.success) {
                    // const analyticsStore = useAnalyticsStore()
                    console.log('[AdminSocket] Initial analytics received (store not implemented yet)')
                }
            })

            this.socket.on('admin:analytics:update', (response) => {
                if (response.success) {
                    // const analyticsStore = useAnalyticsStore()
                    // analyticsStore.updateRealtimeData(response.data)
                    console.log('[AdminSocket] Analytics updated (store not implemented yet)')
                }
            })

            // User count updates
            this.socket.on('admin:users:count', (data) => {
                const adminStore = useAdminStore()
                adminStore.updateRealtimeMetrics({
                    activeUsers: data.total
                })
            })

            // Error events
            this.socket.on('admin:dashboard:error', (response) => {
                console.error('[AdminSocket] Dashboard error:', response.message)
                this.error = response.message
            })

            this.socket.on('admin:orders:error', (response) => {
                console.error('[AdminSocket] Orders error:', response.message)
                this.error = response.message
            })

            this.socket.on('admin:analytics:error', (response) => {
                console.error('[AdminSocket] Analytics error:', response.message)
                this.error = response.message
            })
        },

        /**
         * Subscribe to dashboard statistics
         */
        subscribeToDashboard(updateInterval = 5000) {
            if (!this.socket?.connected) {
                console.warn('[AdminSocket] Cannot subscribe: not connected')
                return
            }

            console.log('[AdminSocket] Subscribing to dashboard...')
            this.socket.emit('admin:dashboard:subscribe', { updateInterval })
            this.dashboardSubscribed = true
        },

        /**
         * Unsubscribe from dashboard
         */
        unsubscribeFromDashboard() {
            if (!this.socket?.connected) return

            console.log('[AdminSocket] Unsubscribing from dashboard...')
            this.socket.emit('admin:dashboard:unsubscribe')
            this.dashboardSubscribed = false
        },

        /**
         * Subscribe to order stream
         */
        subscribeToOrders() {
            if (!this.socket?.connected) {
                console.warn('[AdminSocket] Cannot subscribe to orders: not connected')
                return
            }

            console.log('[AdminSocket] Subscribing to orders...')
            this.socket.emit('admin:orders:subscribe')
            this.ordersSubscribed = true
        },

        /**
         * Unsubscribe from orders
         */
        unsubscribeFromOrders() {
            if (!this.socket?.connected) return

            console.log('[AdminSocket] Unsubscribing from orders...')
            this.socket.emit('admin:orders:unsubscribe')
            this.ordersSubscribed = false
        },

        /**
         * Subscribe to analytics
         */
        subscribeToAnalytics(options = {}) {
            if (!this.socket?.connected) {
                console.warn('[AdminSocket] Cannot subscribe to analytics: not connected')
                return
            }

            console.log('[AdminSocket] Subscribing to analytics...')
            this.socket.emit('admin:analytics:subscribe', options)
            this.analyticsSubscribed = true
        },

        /**
         * Unsubscribe from analytics
         */
        unsubscribeFromAnalytics() {
            if (!this.socket?.connected) return

            console.log('[AdminSocket] Unsubscribing from analytics...')
            this.socket.emit('admin:analytics:unsubscribe')
            this.analyticsSubscribed = false
        },

        /**
         * Force refresh dashboard
         */
        refreshDashboard() {
            if (!this.socket?.connected) return

            console.log('[AdminSocket] Requesting dashboard refresh...')
            this.socket.emit('admin:dashboard:refresh')
        },

        /**
         * Quick confirm order
         */
        quickConfirmOrder(orderId) {
            if (!this.socket?.connected) return

            console.log('[AdminSocket] Quick confirming order:', orderId)
            this.socket.emit('admin:order:quick_confirm', { orderId })
        },

        /**
         * Quick cancel order
         */
        quickCancelOrder(orderId, reason) {
            if (!this.socket?.connected) return

            console.log('[AdminSocket] Quick cancelling order:', orderId)
            this.socket.emit('admin:order:quick_cancel', { orderId, reason })
        },

        /**
         * Show notification
         */
        showNotification(title, message, type = 'info', data = null) {
            const notification = {
                id: Date.now(),
                title,
                message,
                type,
                data,
                read: false,
                createdAt: new Date()
            }

            this.notifications.unshift(notification)
            this.unreadCount++

            // Desktop notification
            if (this.desktopNotificationsEnabled && 'Notification' in window) {
                if (Notification.permission === 'granted') {
                    new Notification(title, {
                        body: message,
                        icon: '/admin-icon.png',
                        badge: '/admin-badge.png'
                    })
                } else if (Notification.permission !== 'denied') {
                    Notification.requestPermission().then((permission) => {
                        if (permission === 'granted') {
                            new Notification(title, { body: message })
                        }
                    })
                }
            }
        },

        /**
         * Play notification sound
         */
        playNotificationSound() {
            if (!this.soundEnabled) return

            try {
                const audio = new Audio('/notification.mp3')
                audio.volume = 0.5
                audio.play()
            } catch (error) {
                console.error('[AdminSocket] Failed to play sound:', error)
            }
        },

        /**
         * Mark notification as read
         */
        markNotificationAsRead(notificationId) {
            const notification = this.notifications.find((n) => n.id === notificationId)
            if (notification && !notification.read) {
                notification.read = true
                this.unreadCount = Math.max(0, this.unreadCount - 1)
            }
        },

        /**
         * Mark all notifications as read
         */
        markAllNotificationsAsRead() {
            this.notifications.forEach((n) => (n.read = true))
            this.unreadCount = 0
        },

        /**
         * Clear notifications
         */
        clearNotifications() {
            this.notifications = []
            this.unreadCount = 0
        },

        /**
         * Clear all notifications (alias)
         */
        clearAllNotifications() {
            this.clearNotifications()
        },

        /**
         * Toggle sound
         */
        toggleSound() {
            this.soundEnabled = !this.soundEnabled
        },

        /**
         * Toggle desktop notifications
         */
        toggleDesktopNotifications() {
            this.desktopNotificationsEnabled = !this.desktopNotificationsEnabled

            if (this.desktopNotificationsEnabled && 'Notification' in window) {
                Notification.requestPermission()
            }
        },

        /**
         * Disconnect socket
         */
        disconnect() {
            if (this.socket) {
                console.log('[AdminSocket] Disconnecting...')

                // Unsubscribe from all
                this.unsubscribeFromDashboard()
                this.unsubscribeFromOrders()
                this.unsubscribeFromAnalytics()

                // Disconnect
                this.socket.disconnect()
                this.socket = null
                this.connected = false
                this.connecting = false
            }
        }
    }
})
