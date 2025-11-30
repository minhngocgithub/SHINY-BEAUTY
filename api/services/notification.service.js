const { redisClient } = require("../config/redis")
const logger = require("../config/logger")

class NotificationService {
    // Notification types
    static TYPES = {
        ORDER_STATUS: 'ORDER_STATUS',
        ORDER_CONFIRMED: 'ORDER_CONFIRMED',
        ORDER_PREPARING: 'ORDER_PREPARING',
        ORDER_SHIPPED: 'ORDER_SHIPPED',
        ORDER_OUT_FOR_DELIVERY: 'ORDER_OUT_FOR_DELIVERY',
        ORDER_DELIVERED: 'ORDER_DELIVERED',
        ORDER_CANCELLED: 'ORDER_CANCELLED',
        PAYMENT: 'PAYMENT',
        PAYMENT_SUCCESS: 'PAYMENT_SUCCESS',
        PAYMENT_FAILED: 'PAYMENT_FAILED',
        ADMIN_NEW_ORDER: 'ADMIN_NEW_ORDER',
        PRODUCT_AVAILABLE: 'PRODUCT_AVAILABLE',
        PRICE_DROP: 'PRICE_DROP',
        FLASH_SALE: 'FLASH_SALE',
        PROMOTION: 'PROMOTION',
        REVIEW_REMINDER: 'REVIEW_REMINDER',
        WISHLIST: 'WISHLIST',
        SYSTEM: 'SYSTEM'
    }

    // Default expiration times
    static TTL = {
        NOTIFICATION: 30 * 24 * 60 * 60, // 30 days
        UNREAD_COUNT: 30 * 24 * 60 * 60,
        PREFERENCES: 365 * 24 * 60 * 60  // 1 year
    }

    /**
     * Create in-app notification with optimized storage
     * Uses Redis Sorted Set for better performance
     */
    static async createNotification(userId, data) {
        try {
            const timestamp = Date.now()
            const notificationId = `notif:${userId}:${timestamp}`

            const notification = {
                id: notificationId,
                type: data.type,
                title: data.title,
                message: data.message,
                data: data.data || {},
                priority: data.priority || 'normal', // low, normal, high, urgent
                actionUrl: data.actionUrl || null,
                read: false,
                createdAt: timestamp
            }

            // Check user preferences before creating
            const canSend = await this.checkNotificationPreference(userId, data.type)
            if (!canSend) {
                logger.debug("Notification blocked by user preferences", {
                    userId,
                    type: data.type
                })
                return null
            }

            // Use pipeline for atomic operations
            const pipeline = redisClient.pipeline()

            // Store notification in Sorted Set (score = timestamp for ordering)
            const notifKey = `notif:user:${userId}`
            pipeline.zadd(notifKey, timestamp, JSON.stringify(notification))

            // Keep only last 100 notifications
            pipeline.zremrangebyrank(notifKey, 0, -101)

            // Increment unread count
            const unreadKey = `notif:unread:${userId}`
            pipeline.incr(unreadKey)

            // Set expiration
            pipeline.expire(notifKey, this.TTL.NOTIFICATION)
            pipeline.expire(unreadKey, this.TTL.UNREAD_COUNT)

            await pipeline.exec()

            logger.info("Notification created", {
                userId,
                type: data.type,
                notificationId
            })

            return notification

        } catch (error) {
            logger.error("Failed to create notification", {
                error: error.message,
                stack: error.stack,
                userId,
                data
            })
            throw error
        }
    }

    /**
     * Create multiple notifications in batch
     */
    static async createBatchNotifications(notifications) {
        try {
            const pipeline = redisClient.pipeline()
            const createdNotifications = []

            for (const { userId, ...data } of notifications) {
                const canSend = await this.checkNotificationPreference(userId, data.type)
                if (!canSend) continue

                const timestamp = Date.now()
                const notificationId = `notif:${userId}:${timestamp}`

                const notification = {
                    id: notificationId,
                    type: data.type,
                    title: data.title,
                    message: data.message,
                    data: data.data || {},
                    priority: data.priority || 'normal',
                    actionUrl: data.actionUrl || null,
                    read: false,
                    createdAt: timestamp
                }

                const notifKey = `notif:user:${userId}`
                const unreadKey = `notif:unread:${userId}`

                pipeline.zadd(notifKey, timestamp, JSON.stringify(notification))
                pipeline.zremrangebyrank(notifKey, 0, -101)
                pipeline.incr(unreadKey)
                pipeline.expire(notifKey, this.TTL.NOTIFICATION)
                pipeline.expire(unreadKey, this.TTL.UNREAD_COUNT)

                createdNotifications.push({ userId, notification })
            }

            await pipeline.exec()

            logger.info("Batch notifications created", {
                count: createdNotifications.length
            })

            return createdNotifications

        } catch (error) {
            logger.error("Failed to create batch notifications", {
                error: error.message
            })
            throw error
        }
    }

    /**
     * Get user notifications with pagination
     * Uses Sorted Set for efficient range queries
     */
    static async getNotifications(userId, options = {}) {
        const {
            limit = 20,
            offset = 0,
            unreadOnly = false,
            types = null // Filter by types
        } = options

        try {
            const notifKey = `notif:user:${userId}`

            // Get notifications in reverse chronological order
            const notifications = await redisClient.zrevrange(
                notifKey,
                offset,
                offset + limit - 1
            )

            let parsed = notifications.map(n => JSON.parse(n))

            // Apply filters
            if (unreadOnly) {
                parsed = parsed.filter(n => !n.read)
            }

            if (types && Array.isArray(types)) {
                parsed = parsed.filter(n => types.includes(n.type))
            }

            // Get total count and unread count
            const [total, unreadCount] = await Promise.all([
                redisClient.zcard(notifKey),
                this.getUnreadCount(userId)
            ])

            return {
                notifications: parsed,
                pagination: {
                    total,
                    unreadCount,
                    limit,
                    offset,
                    hasMore: offset + limit < total
                }
            }

        } catch (error) {
            logger.error("Failed to get notifications", {
                error: error.message,
                userId
            })
            return {
                notifications: [],
                pagination: { total: 0, unreadCount: 0, limit, offset, hasMore: false }
            }
        }
    }

    /**
     * Get unread count efficiently
     */
    static async getUnreadCount(userId) {
        try {
            const unreadKey = `notif:unread:${userId}`
            const count = await redisClient.get(unreadKey)
            return parseInt(count) || 0
        } catch (error) {
            logger.error("Failed to get unread count", { error: error.message, userId })
            return 0
        }
    }

    /**
     * Mark notification as read (optimized)
     */
    static async markAsRead(userId, notificationId) {
        try {
            const notifKey = `notif:user:${userId}`
            const notifications = await redisClient.zrevrange(notifKey, 0, -1)

            for (const notifStr of notifications) {
                const notif = JSON.parse(notifStr)

                if (notif.id === notificationId && !notif.read) {
                    notif.read = true
                    notif.readAt = Date.now()

                    const pipeline = redisClient.pipeline()

                    // Update notification
                    pipeline.zadd(notifKey, notif.createdAt, JSON.stringify(notif))

                    // Decrement unread count
                    const unreadKey = `notif:unread:${userId}`
                    pipeline.decr(unreadKey)

                    await pipeline.exec()

                    logger.info("Notification marked as read", { userId, notificationId })
                    return true
                }
            }

            return false

        } catch (error) {
            logger.error("Failed to mark notification as read", {
                error: error.message,
                userId,
                notificationId
            })
            return false
        }
    }

    /**
     * Mark all notifications as read
     */
    static async markAllAsRead(userId) {
        try {
            const notifKey = `notif:user:${userId}`
            const notifications = await redisClient.zrevrange(notifKey, 0, -1)

            if (notifications.length === 0) {
                return { success: true, updated: 0 }
            }

            const pipeline = redisClient.pipeline()
            let updatedCount = 0

            for (const notifStr of notifications) {
                const notif = JSON.parse(notifStr)

                if (!notif.read) {
                    notif.read = true
                    notif.readAt = Date.now()
                    pipeline.zadd(notifKey, notif.createdAt, JSON.stringify(notif))
                    updatedCount++
                }
            }

            // Reset unread count
            const unreadKey = `notif:unread:${userId}`
            pipeline.set(unreadKey, 0)
            pipeline.expire(unreadKey, this.TTL.UNREAD_COUNT)

            await pipeline.exec()

            logger.info("All notifications marked as read", { userId, count: updatedCount })

            return { success: true, updated: updatedCount }

        } catch (error) {
            logger.error("Failed to mark all as read", {
                error: error.message,
                userId
            })
            return { success: false, updated: 0 }
        }
    }

    /**
     * Delete notification
     */
    static async deleteNotification(userId, notificationId) {
        try {
            const notifKey = `notif:user:${userId}`
            const notifications = await redisClient.zrevrange(notifKey, 0, -1)

            for (const notifStr of notifications) {
                const notif = JSON.parse(notifStr)

                if (notif.id === notificationId) {
                    const pipeline = redisClient.pipeline()

                    pipeline.zrem(notifKey, notifStr)

                    // Decrement unread count if it was unread
                    if (!notif.read) {
                        const unreadKey = `notif:unread:${userId}`
                        pipeline.decr(unreadKey)
                    }

                    await pipeline.exec()

                    logger.info("Notification deleted", { userId, notificationId })
                    return true
                }
            }

            return false

        } catch (error) {
            logger.error("Failed to delete notification", {
                error: error.message,
                userId,
                notificationId
            })
            return false
        }
    }

    /**
     * Clear all notifications for user
     */
    static async clearAllNotifications(userId) {
        try {
            const notifKey = `notif:user:${userId}`
            const unreadKey = `notif:unread:${userId}`

            await Promise.all([
                redisClient.del(notifKey),
                redisClient.del(unreadKey)
            ])

            logger.info("All notifications cleared", { userId })
            return true

        } catch (error) {
            logger.error("Failed to clear notifications", {
                error: error.message,
                userId
            })
            return false
        }
    }

    /**
     * Emit real-time notification via Socket.IO
     */
    static async emitNotification(io, userId, notification) {
        try {
            // Fixed syntax error
            io.to(`user:${userId}`).emit("notification:new", notification)

            // Also emit unread count update
            const unreadCount = await this.getUnreadCount(userId)
            io.to(`user:${userId}`).emit("notification:unread-count", unreadCount)

            logger.debug("Notification emitted via Socket.IO", {
                userId,
                type: notification.type
            })

        } catch (error) {
            logger.error("Failed to emit notification", {
                error: error.message,
                userId
            })
        }
    }

    /**
     * Broadcast notification to multiple users
     */
    static async broadcastNotification(io, userIds, notification) {
        try {
            const notifications = await this.createBatchNotifications(
                userIds.map(userId => ({ userId, ...notification }))
            )

            // Emit to all users
            for (const { userId, notification: notif } of notifications) {
                await this.emitNotification(io, userId, notif)
            }

            logger.info("Notification broadcasted", {
                userCount: userIds.length,
                type: notification.type
            })

        } catch (error) {
            logger.error("Failed to broadcast notification", {
                error: error.message
            })
        }
    }

    /**
     * Set notification preferences
     */
    static async setNotificationPreferences(userId, preferences) {
        try {
            const prefKey = `notif:pref:${userId}`

            // preferences = { ORDER_STATUS: true, PROMOTION: false, ... }
            await redisClient.hset(prefKey, preferences)
            await redisClient.expire(prefKey, this.TTL.PREFERENCES)

            logger.info("Notification preferences updated", { userId, preferences })
            return true

        } catch (error) {
            logger.error("Failed to set preferences", {
                error: error.message,
                userId
            })
            return false
        }
    }

    /**
     * Get notification preferences
     */
    static async getNotificationPreferences(userId) {
        try {
            const prefKey = `notif:pref:${userId}`
            const preferences = await redisClient.hgetall(prefKey)

            // Convert string values to boolean
            const parsed = {}
            for (const [key, value] of Object.entries(preferences)) {
                parsed[key] = value === 'true' || value === '1'
            }

            // Set defaults for missing preferences
            for (const type of Object.values(this.TYPES)) {
                if (!(type in parsed)) {
                    parsed[type] = true // Default: all notifications enabled
                }
            }

            return parsed

        } catch (error) {
            logger.error("Failed to get preferences", {
                error: error.message,
                userId
            })
            // Return all enabled by default
            return Object.values(this.TYPES).reduce((acc, type) => {
                acc[type] = true
                return acc
            }, {})
        }
    }

    /**
     * Check if notification type is enabled for user
     */
    static async checkNotificationPreference(userId, type) {
        try {
            const prefKey = `notif:pref:${userId}`
            const value = await redisClient.hget(prefKey, type)

            // If not set, default is true
            if (value === null) return true

            return value === 'true' || value === '1'

        } catch (error) {
            logger.error("Failed to check preference", {
                error: error.message,
                userId,
                type
            })
            return true // Default to sending
        }
    }

    // ============================================
    // Domain-specific notification methods
    // ============================================

    /**
     * Notify order status change
     */
    static async notifyOrderStatus(io, userId, order, status, message) {
        const notification = await this.createNotification(userId, {
            type: this.TYPES.ORDER_STATUS,
            title: `Order ${status}`,
            message,
            priority: status === 'delivered' ? 'high' : 'normal',
            actionUrl: `/orders/${order._id}`,
            data: {
                orderId: order._id,
                orderNumber: order.orderNumber,
                status,
                totalPrice: order.totalPrice,
                statusTimestamp: Date.now()
            }
        })

        if (notification) {
            await this.emitNotification(io, userId, notification)
        }
    }

    /**
     * Notify payment status
     */
    static async notifyPayment(io, userId, payment, status, message) {
        const notification = await this.createNotification(userId, {
            type: this.TYPES.PAYMENT,
            title: `Payment ${status}`,
            message,
            priority: status === 'failed' ? 'urgent' : 'high',
            actionUrl: `/orders/${payment.orderId}`,
            data: {
                paymentId: payment._id,
                orderId: payment.orderId,
                amount: payment.amount,
                status,
                method: payment.method
            }
        })

        if (notification) {
            await this.emitNotification(io, userId, notification)
        }
    }

    /**
     * Notify product availability
     */
    static async notifyProductAvailable(io, userId, product) {
        const notification = await this.createNotification(userId, {
            type: this.TYPES.PRODUCT_AVAILABLE,
            title: "Back in Stock! 🎉",
            message: `${product.name} is now available`,
            priority: 'normal',
            actionUrl: `/products/${product._id}`,
            data: {
                productId: product._id,
                productName: product.name,
                price: product.price,
                image: product.images?.[0]?.url || null
            }
        })

        if (notification) {
            await this.emitNotification(io, userId, notification)
        }
    }

    /**
     * Notify price drop
     */
    static async notifyPriceDrop(io, userId, product, oldPrice, newPrice) {
        const discount = Math.round(((oldPrice - newPrice) / oldPrice) * 100)

        const notification = await this.createNotification(userId, {
            type: this.TYPES.PRICE_DROP,
            title: `Price Drop Alert! 🔥 ${discount}% OFF`,
            message: `${product.name} is now $${newPrice} (was $${oldPrice})`,
            priority: 'high',
            actionUrl: `/products/${product._id}`,
            data: {
                productId: product._id,
                productName: product.name,
                oldPrice,
                newPrice,
                discount,
                image: product.images?.[0]?.url || null
            }
        })

        if (notification) {
            await this.emitNotification(io, userId, notification)
        }
    }

    /**
     * Notify flash sale
     */
    static async notifyFlashSale(io, userIds, flashSale) {
        await this.broadcastNotification(io, userIds, {
            type: this.TYPES.FLASH_SALE,
            title: `⚡ Flash Sale Started!`,
            message: `${flashSale.name} - Don't miss out!`,
            priority: 'urgent',
            actionUrl: `/flash-sales/${flashSale._id}`,
            data: {
                flashSaleId: flashSale._id,
                name: flashSale.name,
                discount: flashSale.discount,
                startTime: flashSale.startTime,
                endTime: flashSale.endTime
            }
        })
    }

    /**
     * Notify review reminder
     */
    static async notifyReviewReminder(io, userId, order) {
        const notification = await this.createNotification(userId, {
            type: this.TYPES.REVIEW_REMINDER,
            title: "How was your order? ⭐",
            message: "Share your experience and help others!",
            priority: 'low',
            actionUrl: `/orders/${order._id}/review`,
            data: {
                orderId: order._id,
                orderNumber: order.orderNumber,
                deliveredAt: order.deliveredAt
            }
        })

        if (notification) {
            await this.emitNotification(io, userId, notification)
        }
    }

    /**
     * Notify order confirmed
     */
    static async notifyOrderConfirmed(io, userId, order) {
        const notification = await this.createNotification(userId, {
            type: this.TYPES.ORDER_CONFIRMED,
            title: "Order Confirmed ✅",
            message: `Your order #${order.trackingNumber || order._id.toString().slice(-8)} has been confirmed and is being prepared`,
            priority: 'high',
            actionUrl: `/orders/${order._id}`,
            data: {
                orderId: order._id,
                trackingNumber: order.trackingNumber,
                estimatedDelivery: order.estimatedDeliveryDate,
                totalPrice: order.totalPrice
            }
        })

        if (notification) {
            await this.emitNotification(io, userId, notification)
        }
    }

    /**
     * Notify order preparing
     */
    static async notifyOrderPreparing(io, userId, order) {
        const notification = await this.createNotification(userId, {
            type: this.TYPES.ORDER_PREPARING,
            title: "Preparing Your Order 📦",
            message: `We're packing your items with care for order #${order.trackingNumber || order._id.toString().slice(-8)}`,
            priority: 'normal',
            actionUrl: `/orders/${order._id}`,
            data: {
                orderId: order._id,
                trackingNumber: order.trackingNumber,
                estimatedDelivery: order.estimatedDeliveryDate
            }
        })

        if (notification) {
            await this.emitNotification(io, userId, notification)
        }
    }

    /**
     * Notify order shipped
     */
    static async notifyOrderShipped(io, userId, order) {
        const notification = await this.createNotification(userId, {
            type: this.TYPES.ORDER_SHIPPED,
            title: "Order Shipped 🚚",
            message: `Your order #${order.trackingNumber} is on the way!`,
            priority: 'high',
            actionUrl: `/orders/${order._id}/tracking`,
            data: {
                orderId: order._id,
                trackingNumber: order.trackingNumber,
                estimatedDelivery: order.estimatedDeliveryDate,
                carrier: order.carrier
            }
        })

        if (notification) {
            await this.emitNotification(io, userId, notification)
        }
    }

    /**
     * Notify order out for delivery
     */
    static async notifyOrderOutForDelivery(io, userId, order) {
        const notification = await this.createNotification(userId, {
            type: this.TYPES.ORDER_OUT_FOR_DELIVERY,
            title: "Out for Delivery 🏃",
            message: `Your order #${order.trackingNumber} is out for delivery and will arrive soon!`,
            priority: 'urgent',
            actionUrl: `/orders/${order._id}/tracking`,
            data: {
                orderId: order._id,
                trackingNumber: order.trackingNumber,
                estimatedDelivery: order.estimatedDeliveryDate
            }
        })

        if (notification) {
            await this.emitNotification(io, userId, notification)
        }
    }

    /**
     * Notify order delivered
     */
    static async notifyOrderDelivered(io, userId, order) {
        const notification = await this.createNotification(userId, {
            type: this.TYPES.ORDER_DELIVERED,
            title: "Order Delivered ✨",
            message: `Your order #${order.trackingNumber} has been delivered successfully!`,
            priority: 'high',
            actionUrl: `/orders/${order._id}`,
            data: {
                orderId: order._id,
                trackingNumber: order.trackingNumber,
                deliveredAt: order.deliveredAt
            }
        })

        if (notification) {
            await this.emitNotification(io, userId, notification)
        }
    }

    /**
     * Notify order cancelled
     */
    static async notifyOrderCancelled(io, userId, order, reason) {
        const notification = await this.createNotification(userId, {
            type: this.TYPES.ORDER_CANCELLED,
            title: "Order Cancelled ❌",
            message: `Order #${order.trackingNumber || order._id.toString().slice(-8)} has been cancelled`,
            priority: 'high',
            actionUrl: `/orders/${order._id}`,
            data: {
                orderId: order._id,
                trackingNumber: order.trackingNumber,
                reason,
                cancelledAt: order.cancelledAt
            }
        })

        if (notification) {
            await this.emitNotification(io, userId, notification)
        }
    }

    /**
     * Notify payment success
     */
    static async notifyPaymentSuccess(io, userId, order) {
        const notification = await this.createNotification(userId, {
            type: this.TYPES.PAYMENT_SUCCESS,
            title: "Payment Successful 💳",
            message: `Payment received for order #${order.trackingNumber || order._id.toString().slice(-8)}`,
            priority: 'high',
            actionUrl: `/orders/${order._id}`,
            data: {
                orderId: order._id,
                trackingNumber: order.trackingNumber,
                amount: order.totalPrice,
                paymentMethod: order.paymentMethod,
                paidAt: order.paidAt
            }
        })

        if (notification) {
            await this.emitNotification(io, userId, notification)
        }
    }

    /**
     * Notify admin of new order
     */
    static async notifyAdminNewOrder(io, order) {
        // Broadcast to all admin users
        const notification = {
            type: this.TYPES.ADMIN_NEW_ORDER,
            title: "New Order Received 🛍️",
            message: `Order #${order.trackingNumber || order._id.toString().slice(-8)} - $${order.totalPrice}`,
            priority: 'high',
            actionUrl: `/admin/orders/${order._id}`,
            data: {
                orderId: order._id,
                trackingNumber: order.trackingNumber,
                totalPrice: order.totalPrice,
                customerName: order.shippingAddress?.fullName,
                createdAt: order.createdAt
            }
        }

        // Emit to admin room
        if (io) {
            io.to('admin:orders').emit('notification:new', notification)
            logger.info('Admin notification sent', { orderId: order._id })
        }
    }

    /**
     * Get notification statistics
     */
    static async getNotificationStats(userId) {
        try {
            const notifKey = `notif:user:${userId}`
            const notifications = await redisClient.zrevrange(notifKey, 0, -1)

            const stats = {
                total: notifications.length,
                unread: 0,
                byType: {},
                byPriority: {}
            }

            for (const notifStr of notifications) {
                const notif = JSON.parse(notifStr)

                if (!notif.read) stats.unread++

                stats.byType[notif.type] = (stats.byType[notif.type] || 0) + 1
                stats.byPriority[notif.priority] = (stats.byPriority[notif.priority] || 0) + 1
            }

            return stats

        } catch (error) {
            logger.error("Failed to get notification stats", {
                error: error.message,
                userId
            })
            return null
        }
    }
}

module.exports = NotificationService