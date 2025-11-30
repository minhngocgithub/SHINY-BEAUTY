class RealtimeService {
    constructor() {
        this.io = null
    }

    initialize(io) {
        this.io = io
    }

    // Order updates
    emitOrderUpdate(orderId, userId, data) {
        if (!this.io) return

        // Send to specific user
        this.io.to(`user:${userId}`).emit("order:updated", {
            orderId,
            ...data,
            timestamp: new Date(),
        })

        // Send to admin dashboard
        this.io.to("admin-room").emit("admin:order-updated", {
            orderId,
            userId,
            ...data,
        })
    }

    // Flash sale updates
    emitFlashSaleStockUpdate(productId, stock) {
        if (!this.io) return

        this.io.to(`flashsale:${productId}`).emit("flashsale:stock-update", {
            productId,
            remaining: stock,
            timestamp: new Date(),
        })
    }

    // Cart sync
    emitCartSync(userId, cart) {
        if (!this.io) return

        this.io.to(`user:${userId}`).emit("cart:synced", {
            cart,
            timestamp: new Date(),
        })
    }

    // Notifications
    sendNotification(userId, notification) {
        if (!this.io) return

        this.io.to(`user:${userId}`).emit("notification:new", {
            ...notification,
            timestamp: new Date(),
        })
    }

    // Wishlist price drop alert
    emitPriceDropAlert(userId, product) {
        if (!this.io) return

        this.io.to(`user:${userId}`).emit("notification:price-drop", {
            productId: product._id,
            productName: product.productName,
            oldPrice: product.originalPrice,
            newPrice: product.salePrice,
            discount: (((product.originalPrice - product.salePrice) / product.originalPrice) * 100).toFixed(2),
            timestamp: new Date(),
        })
    }

    // Admin analytics
    emitAdminAnalytics(data) {
        if (!this.io) return

        this.io.to("admin-room").emit("admin:analytics-update", {
            ...data,
            timestamp: new Date(),
        })
    }

    // Live user count
    broadcastUserCount(count) {
        if (!this.io) return

        this.io.emit("stats:active-users", {
            count,
            timestamp: new Date(),
        })
    }
}

module.exports = new RealtimeService()
