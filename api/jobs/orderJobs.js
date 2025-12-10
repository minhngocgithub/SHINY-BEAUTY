const cron = require('node-cron');
const Order = require('../models/order.models');
const NotificationService = require('../services/notification.service');
const OrderTrackingService = require('../services/orderTracking.service');

const calculateCurrentStatus = (confirmedDate, estimatedDeliveryDate) => {
    const now = new Date();
    const confirmedTime = new Date(confirmedDate).getTime();
    const deliveryTime = new Date(estimatedDeliveryDate).getTime();
    const totalDuration = deliveryTime - confirmedTime;
    const elapsed = now.getTime() - confirmedTime;
    const progress = elapsed / totalDuration;

    // If delivery time passed, mark as delivered
    if (now >= deliveryTime) {
        return 'DELIVERED';
    }
    if (progress < 0.25) {
        return 'PREPARING';
    } else if (progress < 0.75) {
        return 'IN_TRANSIT';
    } else {
        return 'OUT_FOR_DELIVERY';
    }
};

const calculateStatusTimeline = (confirmedDate, estimatedDeliveryDate) => {
    const confirmed = new Date(confirmedDate).getTime();
    const delivery = new Date(estimatedDeliveryDate).getTime();
    const totalDuration = delivery - confirmed;

    return {
        CONFIRMED: new Date(confirmed),
        PREPARING: new Date(confirmed), // Starts immediately
        IN_TRANSIT: new Date(confirmed + totalDuration * 0.25), // 25% through
        OUT_FOR_DELIVERY: new Date(confirmed + totalDuration * 0.75), // 75% through
        DELIVERED: new Date(delivery)
    };
};

const initAutoOrderStatusUpdateJob = () => {
    // Run every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
        try {
            console.log('🚚 [ORDER JOB] Running auto order status update...');

            const now = new Date();

            // Find all confirmed orders that haven't been delivered yet
            const confirmedOrders = await Order.find({
                status: {
                    $in: ['CONFIRMED', 'PREPARING', 'IN_TRANSIT', 'OUT_FOR_DELIVERY']
                },
                estimatedDeliveryDate: { $exists: true },
                isDelivered: false
            }).populate('user', 'name email');

            console.log(`📦 Found ${confirmedOrders.length} orders to check`);

            let updatedCount = 0;

            for (const order of confirmedOrders) {
                try {
                    // Use paidAt or updatedAt as confirmation time if not explicitly set
                    const confirmedDate = order.paidAt || order.updatedAt;

                    if (!confirmedDate || !order.estimatedDeliveryDate) {
                        continue;
                    }

                    // Calculate what status should be now
                    const expectedStatus = calculateCurrentStatus(
                        confirmedDate,
                        order.estimatedDeliveryDate
                    );

                    // Only update if status should change
                    if (expectedStatus !== order.status) {
                        const oldStatus = order.status;
                        order.status = expectedStatus;

                        // If delivered, mark as such
                        if (expectedStatus === 'DELIVERED') {
                            order.isDelivered = true;
                            order.deliveredAt = now;
                            order.actualDeliveryDate = now;
                        }

                        // Add timeline event
                        const statusMessages = {
                            PREPARING: 'Your order is being prepared for shipment',
                            IN_TRANSIT: 'Your order is on the way to you',
                            OUT_FOR_DELIVERY: 'Your order is out for delivery',
                            DELIVERED: 'Your order has been delivered successfully'
                        };

                        order.timeline.push({
                            status: expectedStatus,
                            message: statusMessages[expectedStatus] || 'Order status updated',
                            timestamp: now,
                            location: order.shippingAddress
                        });

                        await order.save();
                        updatedCount++;

                        console.log(`✅ Updated order ${order._id}: ${oldStatus} → ${expectedStatus}`);

                        // Send notification to user
                        try {
                            const io = global.io;
                            if (io && order.user) {
                                io.to(`user_${order.user._id}`).emit('order:status_updated', {
                                    success: true,
                                    data: {
                                        orderId: order._id,
                                        status: expectedStatus,
                                        message: statusMessages[expectedStatus],
                                        timestamp: now
                                    }
                                });

                                // Also emit to order-specific room for real-time tracking
                                io.to(`order:${order._id}`).emit('order:status_changed', {
                                    success: true,
                                    orderId: order._id,
                                    oldStatus,
                                    newStatus: expectedStatus,
                                    message: statusMessages[expectedStatus],
                                    timestamp: now
                                });

                                // Send notification based on status
                                if (expectedStatus === 'IN_TRANSIT') {
                                    await NotificationService.notifyOrderShipped(io, order);
                                } else if (expectedStatus === 'OUT_FOR_DELIVERY') {
                                    await NotificationService.notifyOrderOutForDelivery(io, order);
                                } else if (expectedStatus === 'DELIVERED') {
                                    await NotificationService.notifyOrderDelivered(io, order);
                                    // Emit delivered event to order room
                                    io.to(`order:${order._id}`).emit('order:delivered', {
                                        success: true,
                                        orderId: order._id,
                                        deliveredAt: now,
                                        message: 'Your order has been delivered successfully'
                                    });
                                }
                            }
                        } catch (notifError) {
                            console.error('Error sending notification:', notifError);
                        }
                    }
                } catch (orderError) {
                    console.error(`Error processing order ${order._id}:`, orderError);
                }
            }

            console.log(`✅ [ORDER JOB] Updated ${updatedCount} order(s)`);
        } catch (error) {
            console.error('❌ [ORDER JOB] Auto status update failed:', error);
        }
    });

    console.log('✅ Auto order status update job scheduled (every 30 minutes)');
};

/**
 * Check for overdue deliveries
 * Runs daily at 9 AM to check for orders past their estimated delivery date
 */
const initOverdueDeliveryCheckJob = () => {
    // Run daily at 9:00 AM
    cron.schedule('0 9 * * *', async () => {
        try {
            console.log('⏰ [ORDER JOB] Checking for overdue deliveries...');

            const now = new Date();

            // Find orders past their estimated delivery date but not delivered
            const overdueOrders = await Order.find({
                estimatedDeliveryDate: { $lt: now },
                isDelivered: false,
                status: { $ne: 'CANCELLED' }
            }).populate('user', 'name email');

            console.log(`📦 Found ${overdueOrders.length} overdue order(s)`);

            for (const order of overdueOrders) {
                try {
                    // Add overdue note to timeline
                    order.timeline.push({
                        status: 'DELAYED',
                        message: 'Delivery is taking longer than expected. We apologize for the delay.',
                        timestamp: now
                    });

                    await order.save();

                    // Notify admins
                    const io = global.io;
                    if (io) {
                        io.to('admin').emit('admin:order:overdue', {
                            success: true,
                            data: {
                                orderId: order._id,
                                estimatedDelivery: order.estimatedDeliveryDate,
                                daysOverdue: Math.ceil((now - order.estimatedDeliveryDate) / (1000 * 60 * 60 * 24))
                            }
                        });
                    }
                } catch (orderError) {
                    console.error(`Error processing overdue order ${order._id}:`, orderError);
                }
            }

            console.log(`✅ [ORDER JOB] Checked ${overdueOrders.length} overdue order(s)`);
        } catch (error) {
            console.error('❌ [ORDER JOB] Overdue check failed:', error);
        }
    });

    console.log('✅ Overdue delivery check job scheduled (daily at 9:00 AM)');
};

/**
 * Auto-generate tracking updates for in-transit orders
 * Runs every hour to simulate GPS tracking updates
 */
const initTrackingUpdateJob = () => {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
        try {
            console.log('📍 [ORDER JOB] Updating tracking for in-transit orders...');

            // Find orders currently in transit or out for delivery
            const activeOrders = await Order.find({
                status: { $in: ['IN_TRANSIT', 'OUT_FOR_DELIVERY'] },
                isDelivered: false
            });

            console.log(`📦 Found ${activeOrders.length} active shipment(s)`);

            for (const order of activeOrders) {
                try {
                    // Update tracking location using OrderTrackingService
                    const tracking = await OrderTrackingService.getOrderTracking(order._id);

                    if (tracking) {
                        console.log(`📍 Updated tracking for order ${order._id}`);
                    }
                } catch (trackingError) {
                    console.error(`Error updating tracking for order ${order._id}:`, trackingError);
                }
            }

            console.log(`✅ [ORDER JOB] Tracking updates completed`);
        } catch (error) {
            console.error('❌ [ORDER JOB] Tracking update failed:', error);
        }
    });

    console.log('✅ Tracking update job scheduled (every hour)');
};

/**
 * Send delivery reminder to customers
 * Runs daily at 8 AM to remind customers about incoming deliveries
 */
const initDeliveryReminderJob = () => {
    // Run daily at 8:00 AM
    cron.schedule('0 8 * * *', async () => {
        try {
            console.log('🔔 [ORDER JOB] Sending delivery reminders...');

            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(23, 59, 59, 999);

            // Find orders expected to be delivered today or tomorrow
            const upcomingOrders = await Order.find({
                estimatedDeliveryDate: {
                    $gte: today,
                    $lte: tomorrow
                },
                isDelivered: false,
                status: { $in: ['IN_TRANSIT', 'OUT_FOR_DELIVERY'] }
            }).populate('user', 'name email');

            console.log(`📦 Found ${upcomingOrders.length} upcoming deliverie(s)`);

            for (const order of upcomingOrders) {
                try {
                    const io = global.io;
                    if (io && order.user) {
                        io.to(`user_${order.user._id}`).emit('order:delivery_reminder', {
                            success: true,
                            data: {
                                orderId: order._id,
                                estimatedDelivery: order.estimatedDeliveryDate,
                                message: 'Your order is arriving soon!'
                            }
                        });
                    }
                } catch (notifError) {
                    console.error(`Error sending reminder for order ${order._id}:`, notifError);
                }
            }

            console.log(`✅ [ORDER JOB] Sent ${upcomingOrders.length} reminder(s)`);
        } catch (error) {
            console.error('❌ [ORDER JOB] Delivery reminder failed:', error);
        }
    });

    console.log('✅ Delivery reminder job scheduled (daily at 8:00 AM)');
};

module.exports = {
    initAutoOrderStatusUpdateJob,
    initOverdueDeliveryCheckJob,
    initTrackingUpdateJob,
    initDeliveryReminderJob,
    calculateCurrentStatus,
    calculateStatusTimeline
};
