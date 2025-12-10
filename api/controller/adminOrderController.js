const Order = require("../models/order.models")
const OrderTrackingService = require("../services/orderTracking.service")
const NotificationService = require("../services/notification.service")
const ShippingService = require("../services/shipping.service")
const realtimeService = require("../services/realtime.service")
const SaleProgramTrackingService = require("../services/saleProgramTracking.service")
const logger = require("../config/logger")

/**
 * Get all pending orders
 */
const getPendingOrders = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query
        const skip = (parseInt(page) - 1) * parseInt(limit)

        const orders = await Order.find({ status: "PENDING" })
            .populate("user", "name email phone")
            .populate("orderItems.product", "name images price")
            .populate("orderItems.bundle", "name images bundlePrice")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))

        const total = await Order.countDocuments({ status: "PENDING" })

        res.status(200).json({
            success: true,
            data: {
                orders,
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
                currentPage: parseInt(page)
            }
        })
    } catch (error) {
        logger.error("Error getting pending orders", { error: error.message })
        res.status(500).json({
            success: false,
            message: "Failed to get pending orders"
        })
    }
}

/**
 * Confirm order
 */
const confirmOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate("user", "name email")

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            })
        }

        if (order.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message: `Cannot confirm order with status ${order.status}`
            })
        }

        const trackingNumber = OrderTrackingService.generateTrackingNumber()
        const shippingInfo = ShippingService.calculateShippingFee(
            order.shippingAddress?.city,
            false,
            false
        )

        const deliveryTime = ShippingService.calculateDeliveryTime(order.shippingAddress?.city)

        order.status = "CONFIRMED"
        order.trackingNumber = trackingNumber
        order.shippingZone = shippingInfo.zone
        order.shippingDistance = shippingInfo.distance
        order.estimatedDeliveryDate = deliveryTime.estimatedDate

        try {
            order.timeline = OrderTrackingService.createInitialTimeline(order)
        } catch {
            order.timeline = []
        }

        try {
            OrderTrackingService.addTimelineEvent(
                order.timeline,
                "CONFIRMED",
                null,
                "Order confirmed by admin",
                req.user._id
            )
        } catch { }

        await order.save()

        // Update Sale Program stats (revenue & successful orders)
        await SaleProgramTrackingService.updateProgramStats(order, 'confirmed')

        const io = req.app.get("io")

        if (io) {
            // notify user
            try {
                await NotificationService.notifyOrderConfirmed(io, order.user._id, order)
            } catch { }

            // realtime event
            try {
                await realtimeService.notifyOrderUpdate(io, order.user._id, order)
                io.to(`order:${order._id}`).emit("order:status_changed", {
                    orderId: order._id,
                    status: "CONFIRMED",
                    trackingNumber,
                    timeline: order.timeline
                })
            } catch { }

            // emit admin update
            try {
                io.of("/admin")
                    .to("admin:orders")
                    .emit("admin:order:updated", {
                        success: true,
                        data: order,
                        action: "confirmed",
                        by: req.user._id,
                        timestamp: new Date()
                    })

                // invalidate dashboard cache
                const AdminDashboardService = require("../services/adminDashboard.service")
                await AdminDashboardService.invalidateCache()
                const updatedStats = await AdminDashboardService.getDashboardStats(true)

                io.of("/admin")
                    .to("admin:dashboard")
                    .emit("admin:dashboard:update", {
                        success: true,
                        data: updatedStats,
                        updateType: "order_confirmed",
                        timestamp: new Date()
                    })
            } catch { }
        }

        logger.info("Order confirmed", {
            orderId: order._id,
            trackingNumber,
            adminId: req.user._id
        })

        res.status(200).json({
            success: true,
            message: "Order confirmed successfully",
            order
        })
    } catch (error) {
        logger.error("Error confirming order", {
            error: error.message,
            stack: error.stack,
            orderId: req.params.id
        })

        res.status(500).json({
            success: false,
            message: "Failed to confirm order"
        })
    }
}

/**
 * Cancel order
 */
const cancelOrder = async (req, res) => {
    try {
        const { reason, refund = false } = req.body

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: "Cancellation reason is required"
            })
        }

        const order = await Order.findById(req.params.id).populate("user", "name email")

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            })
        }

        if (order.status === "DELIVERED") {
            return res.status(400).json({
                success: false,
                message: "Cannot cancel delivered order"
            })
        }

        if (order.status === "CANCELLED") {
            return res.status(400).json({
                success: false,
                message: "Order is already cancelled"
            })
        }

        order.status = "CANCELLED"
        order.cancellationReason = reason
        order.cancelledBy = req.user._id
        order.cancelledAt = new Date()

        OrderTrackingService.addTimelineEvent(
            order.timeline,
            "CANCELLED",
            null,
            `Order cancelled by admin: ${reason}`,
            req.user._id
        )

        await order.save()

        // Update Sale Program stats (decrement usage)
        await SaleProgramTrackingService.updateProgramStats(order, 'cancelled')

        const io = req.app.get("io")

        if (io) {
            await NotificationService.notifyOrderCancelled(io, order.user._id, order, reason)

            io.to(`order:${order._id}`).emit("order:cancelled", {
                orderId: order._id,
                reason,
                cancelledAt: order.cancelledAt
            })

            io.of("/admin")
                .to("admin:orders")
                .emit("admin:order:updated", {
                    success: true,
                    data: order,
                    action: "cancelled",
                    by: req.user._id,
                    timestamp: new Date()
                })

            const AdminDashboardService = require("../services/adminDashboard.service")
            await AdminDashboardService.invalidateCache()
            const updatedStats = await AdminDashboardService.getDashboardStats(true)

            io.of("/admin")
                .to("admin:dashboard")
                .emit("admin:dashboard:update", {
                    success: true,
                    data: updatedStats,
                    updateType: "order_cancelled",
                    timestamp: new Date()
                })
        }

        logger.info("Order cancelled by admin", {
            orderId: order._id,
            reason,
            adminId: req.user._id
        })

        res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            order
        })
    } catch (error) {
        logger.error("Error cancelling order", {
            error: error.message,
            orderId: req.params.id
        })
        res.status(500).json({
            success: false,
            message: "Failed to cancel order"
        })
    }
}

/**
 * Update order status
 */
const updateOrderStatus = async (req, res) => {
    try {
        const { status, location, message } = req.body

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Status is required"
            })
        }

        const order = await Order.findById(req.params.id).populate("user", "name email")

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            })
        }

        const validation = OrderTrackingService.validateStatusTransition(order.status, status)

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.reason
            })
        }

        const oldStatus = order.status
        order.status = status

        OrderTrackingService.addTimelineEvent(
            order.timeline,
            status,
            location,
            message,
            req.user._id
        )

        if (status === "DELIVERED") {
            order.isDelivered = true
            order.deliveredAt = new Date()
            order.actualDeliveryDate = new Date()
            order.reviewEligible = true

            // ✅ Mark COD orders as paid when delivered
            if (order.paymentMethod === 'COD' && !order.isPaid) {
                order.isPaid = true
                order.paidAt = new Date()
                if (!order.paymentResult) {
                    order.paymentResult = {}
                }
                order.paymentResult.status = 'paid'
                order.paymentResult.paidAt = new Date()
                logger.info(`COD payment marked as paid for order ${order._id}`)
            }

            // Update Sale Program stats (revenue & successful orders if not already counted)
            await SaleProgramTrackingService.updateProgramStats(order, 'delivered')

            // Award loyalty points and update tier
            const LoyaltyService = require('../utils/loyalty.utils')
            try {
                await LoyaltyService.syncUserLoyaltyData(order.user)
                logger.info(`Loyalty data synced for user ${order.user} on order delivery`)
            } catch (loyaltyError) {
                logger.error(`Failed to sync loyalty data for user ${order.user}:`, loyaltyError)
            }
        }

        await order.save()

        const io = req.app.get("io")

        if (io) {
            switch (status) {
                case "PREPARING":
                    await NotificationService.notifyOrderPreparing(io, order.user._id, order)
                    break
                case "IN_TRANSIT":
                    await NotificationService.notifyOrderShipped(io, order.user._id, order)
                    break
                case "OUT_FOR_DELIVERY":
                    await NotificationService.notifyOrderOutForDelivery(
                        io,
                        order.user._id,
                        order
                    )
                    break
                case "DELIVERED":
                    await NotificationService.notifyOrderDelivered(io, order.user._id, order)
                    break
            }

            io.to(`order:${order._id}`).emit("order:status_changed", {
                orderId: order._id,
                oldStatus,
                newStatus: status,
                timeline: order.timeline
            })
        }

        logger.info("Order status updated", {
            orderId: order._id,
            oldStatus,
            newStatus: status,
            adminId: req.user._id
        })

        res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            order
        })
    } catch (error) {
        logger.error("Error updating order status", {
            error: error.message,
            orderId: req.params.id
        })
        res.status(500).json({
            success: false,
            message: "Failed to update order status"
        })
    }
}

/**
 * Update tracking location
 */
const updateTracking = async (req, res) => {
    try {
        const { location, message } = req.body

        if (!location || !location.lat || !location.lng) {
            return res.status(400).json({
                success: false,
                message: "Location with lat/lng is required"
            })
        }

        const order = await Order.findById(req.params.id)

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            })
        }

        const updated = OrderTrackingService.updateTrackingLocation(order, location)
        order.timeline = updated.timeline

        await order.save()

        const io = req.app.get("io")

        if (io) {
            io.to(`order:${order._id}`).emit("order:location_updated", {
                orderId: order._id,
                location,
                message: message || "Location updated"
            })
        }

        logger.info("Order tracking updated", {
            orderId: order._id,
            location
        })

        res.status(200).json({
            success: true,
            message: "Tracking updated successfully",
            currentLocation: location
        })
    } catch (error) {
        logger.error("Error updating tracking", {
            error: error.message,
            orderId: req.params.id
        })
        res.status(500).json({
            success: false,
            message: "Failed to update tracking"
        })
    }
}

/**
 * Get statistics
 */
const getOrderStatistics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query

        const dateFilter = {}
        if (startDate) dateFilter.$gte = new Date(startDate)
        if (endDate) dateFilter.$lte = new Date(endDate)

        const matchFilter =
            Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}

        const [statusStats, revenueStats, totalOrders] = await Promise.all([
            Order.aggregate([
                { $match: matchFilter },
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 },
                        totalRevenue: { $sum: "$totalPrice" }
                    }
                }
            ]),

            Order.aggregate([
                { $match: { ...matchFilter, isPaid: true } },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$totalPrice" },
                        averageOrderValue: { $avg: "$totalPrice" },
                        totalOrders: { $sum: 1 }
                    }
                }
            ]),

            Order.countDocuments(matchFilter)
        ])

        const pendingCount = await Order.countDocuments({
            ...matchFilter,
            status: "PENDING"
        })

        const statistics = {
            totalOrders,
            pendingOrders: pendingCount,
            statusBreakdown: statusStats.reduce((acc, s) => {
                acc[s._id] = {
                    count: s.count,
                    revenue: s.totalRevenue
                }
                return acc
            }, {}),
            revenue:
                revenueStats[0] || {
                    totalRevenue: 0,
                    averageOrderValue: 0,
                    totalOrders: 0
                }
        }

        res.status(200).json({
            success: true,
            statistics
        })
    } catch (error) {
        logger.error("Error getting order statistics", {
            error: error.message
        })
        res.status(500).json({
            success: false,
            message: "Failed to get order statistics"
        })
    }
}

/**
 * Add admin notes
 */
const addAdminNotes = async (req, res) => {
    try {
        const { notes } = req.body

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { adminNotes: notes },
            { new: true }
        )

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            })
        }

        logger.info("Admin notes added", {
            orderId: order._id,
            adminId: req.user._id
        })

        res.status(200).json({
            success: true,
            message: "Notes added successfully",
            order
        })
    } catch (error) {
        logger.error("Error adding admin notes", {
            error: error.message,
            orderId: req.params.id
        })
        res.status(500).json({
            success: false,
            message: "Failed to add notes"
        })
    }
}

module.exports = {
    getPendingOrders,
    confirmOrder,
    cancelOrder,
    updateOrderStatus,
    updateTracking,
    getOrderStatistics,
    addAdminNotes
}
