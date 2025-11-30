const Order = require("../../models/order.models");
const OrderTrackingService = require("../../services/orderTracking.service");
const ShippingService = require("../../services/shipping.service");
const realtimeService = require("../../services/realtime.service");
const logger = require("../../config/logger");

function registerOrderHandlers(io, socket) {
  /**
   * Subscribe to order updates
   * User joins order-specific room to receive real-time updates
   */
  socket.on("order:subscribe", async (orderId) => {
    try {
      const order = await Order.findById(orderId);

      if (!order) {
        return socket.emit("error", { message: "Order not found" });
      }

      // Verify user owns this order or is admin
      if (order.user.toString() !== socket.userId && !socket.isAdmin) {
        return socket.emit("error", { message: "Unauthorized" });
      }

      socket.join(`order:${orderId}`);

      // Get current tracking info
      const trackingInfo = OrderTrackingService.getTrackingInfo(order);
      const progress = OrderTrackingService.calculateDeliveryProgress(order);

      socket.emit("order:subscribed", {
        orderId,
        status: order.status,
        trackingNumber: order.trackingNumber,
        trackingInfo,
        progress,
        estimatedDelivery: order.estimatedDeliveryDate,
        timeline: order.timeline || [],
      });

      logger.info("User subscribed to order", {
        userId: socket.userId,
        orderId,
      });
    } catch (error) {
      logger.error("Error subscribing to order", {
        error: error.message,
        orderId,
        userId: socket.userId,
      });
      socket.emit("error", { message: "Failed to subscribe to order" });
    }
  });

  /**
   * Unsubscribe from order updates
   */
  socket.on("order:unsubscribe", (orderId) => {
    socket.leave(`order:${orderId}`);
    socket.emit("order:unsubscribed", { orderId });

    logger.info("User unsubscribed from order", {
      userId: socket.userId,
      orderId,
    });
  });

  /**
   * Request full tracking data with map route
   */
  socket.on("order:request_tracking", async ({ orderId }) => {
    try {
      const order = await Order.findById(orderId);

      if (!order) {
        return socket.emit("error", { message: "Order not found" });
      }

      // Verify authorization
      if (order.user.toString() !== socket.userId && !socket.isAdmin) {
        return socket.emit("error", { message: "Unauthorized" });
      }

      // Get destination coordinates
      const provinceData = ShippingService.PROVINCES[order.shippingAddress.city];
      let destinationCoords = {
        lat: 21.0285,
        lng: 105.8542,
        address: order.shippingAddress.address + ", " + order.shippingAddress.city,
      };

      if (provinceData && provinceData.coordinates) {
        destinationCoords = {
          ...provinceData.coordinates,
          address: order.shippingAddress.address + ", " + order.shippingAddress.city,
        };
      }

      // Create full tracking data
      const trackingData = OrderTrackingService.createTrackingData(order, destinationCoords);

      socket.emit("order:tracking_data", trackingData);

      logger.info("Tracking data sent", {
        userId: socket.userId,
        orderId,
      });
    } catch (error) {
      logger.error("Error getting tracking data", {
        error: error.message,
        orderId,
      });
      socket.emit("error", { message: "Failed to get tracking data" });
    }
  });

  /**
   * Admin: Join admin orders room
   */
  socket.on("admin:join_orders", () => {
    if (!socket.isAdmin) {
      return socket.emit("error", { message: "Admin access required" });
    }

    socket.join("admin:orders");
    socket.emit("admin:orders_joined");

    logger.info("Admin joined orders room", {
      userId: socket.userId,
    });
  });

  /**
   * Admin: Leave admin orders room
   */
  socket.on("admin:leave_orders", () => {
    socket.leave("admin:orders");
    socket.emit("admin:orders_left");
  });

  /**
   * Legacy support: Keep old "order:track" event
   */
  socket.on("order:track", async (orderId) => {
    // Redirect to new subscribe event
    socket.emit("order:subscribe", orderId);
  });

  /**
   * Legacy support: Keep old "order:untrack" event
   */
  socket.on("order:untrack", (orderId) => {
    socket.emit("order:unsubscribe", orderId);
  });
}

/**
 * Emit order status change to all subscribers
 */
function emitOrderStatusChange(io, orderId, data) {
  io.to(`order:${orderId}`).emit("order:status_changed", {
    orderId,
    ...data,
    timestamp: new Date(),
  });

  logger.info("Order status change emitted", {
    orderId,
    status: data.newStatus,
  });
}

/**
 * Emit location update to all subscribers
 */
function emitLocationUpdate(io, orderId, location) {
  io.to(`order:${orderId}`).emit("order:location_updated", {
    orderId,
    location,
    timestamp: new Date(),
  });

  logger.info("Location update emitted", {
    orderId,
    location,
  });
}

/**
 * Emit order confirmed event
 */
function emitOrderConfirmed(io, orderId, data) {
  io.to(`order:${orderId}`).emit("order:confirmed", {
    orderId,
    ...data,
    timestamp: new Date(),
  });

  logger.info("Order confirmed event emitted", {
    orderId,
  });
}

/**
 * Emit order cancelled event
 */
function emitOrderCancelled(io, orderId, reason) {
  io.to(`order:${orderId}`).emit("order:cancelled", {
    orderId,
    reason,
    timestamp: new Date(),
  });

  logger.info("Order cancelled event emitted", {
    orderId,
    reason,
  });
}

/**
 * Emit order delivered event
 */
function emitOrderDelivered(io, orderId, deliveryInfo) {
  io.to(`order:${orderId}`).emit("order:delivered", {
    orderId,
    ...deliveryInfo,
    timestamp: new Date(),
  });

  logger.info("Order delivered event emitted", {
    orderId,
  });
}

module.exports = {
  registerOrderHandlers,
  emitOrderStatusChange,
  emitLocationUpdate,
  emitOrderConfirmed,
  emitOrderCancelled,
  emitOrderDelivered,
};
