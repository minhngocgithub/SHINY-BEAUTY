const Product = require('../models/product.models')
const Order = require('../models/order.models')
const realtimeService = require('../services/realtime.service')
const ShippingService = require('../services/shipping.service')
const OrderTrackingService = require('../services/orderTracking.service')
const NotificationService = require('../services/notification.service')

const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      paymentStatus,
      userId,
      search,
      startDate,
      endDate
    } = req.query;

    let filter = {};

    // Filter by order status
    if (status) filter.orderStatus = status;

    // Filter by payment status
    if (paymentStatus) filter['paymentInfo.status'] = paymentStatus;

    // Filter by user
    if (userId) filter.user = userId;

    // Search by order number or user info
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { _id: search.match(/^[0-9a-fA-F]{24}$/) ? search : null }
      ].filter(Boolean);
    }

    // Filter by date range
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name images price')
      .populate('orderItems.bundle', 'name images bundlePrice')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    const totalAgg = await Order.aggregate([
      { $match: filter },
      { $group: { _id: null, totalAmount: { $sum: "$totalPrice" } } }
    ]);
    const totalAmount = totalAgg[0]?.totalAmount || 0;

    res.status(200).json({
      success: true,
      data: {
        orders,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        totalAmount
      }
    });
  } catch (err) {
    console.error('Get all orders error:', err);
    res.status(500).json({
      success: false,
      message: err.message || "Internal server error"
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name price image brand')
      .populate('orderItems.bundle', 'name bundlePrice image items');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, order });
  } catch (err) {
    console.error('Get order by ID error:', err);
    res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
  }
}

const updateOrderToDelivery = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (order.isDelivered) {
      return res.status(400).json({
        success: false,
        message: "Order already delivered"
      });
    }
    order.markAsDelivered();
    const updatedOrder = await order.save();

    // Emit Socket.IO event for order delivery
    realtimeService.emitOrderUpdate(
      updatedOrder._id,
      updatedOrder.user.toString(),
      {
        status: 'delivered',
        orderStatus: updatedOrder.orderStatus,
        message: 'Your order has been delivered',
        deliveredAt: updatedOrder.deliveredAt
      }
    )

    res.status(200).json({
      success: true,
      message: "Order marked as delivered",
      order: updatedOrder
    });
  } catch (err) {
    console.error("Update order delivery error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}

const getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    let filter = { user: req.user.id || req.user._id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filter)
      .populate('orderItems.product', 'name image')
      .populate('orderItems.bundle', 'name image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      orders,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}
const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      appliedPrograms = [],
      couponProgram,
      couponCode,
      note,
    } = req.body

    let itemsPrice = 0
    let totalDiscount = 0
    let couponDiscount = 0

    const enhancedOrderItems = orderItems.map((item) => ({
      ...item,
      originalPrice: item.price, // Store original price before discounts
    }))

    // Calculate items price (in USD)
    enhancedOrderItems.forEach((item) => {
      itemsPrice += item.originalPrice * item.quantity
    })

    // Calculate program discounts
    appliedPrograms.forEach((program) => {
      totalDiscount += program.discountAmount
    })

    // Calculate coupon discount
    if (couponProgram && couponCode) {
      couponDiscount = req.body.couponDiscount || 0
      totalDiscount += couponDiscount
    }

    // ✅ Calculate tax (10% of subtotal)
    const taxPrice = itemsPrice * 0.1

    // ✅ Calculate shipping using priority rules with distance-based calculation
    let shippingPrice = 0
    let shippingReason = 'STANDARD_RATE'
    let hasFreeShipping = false

    // Priority 1: Check if Sale Program provides free shipping
    if (appliedPrograms.some(p => p.benefits?.freeShipping)) {
      hasFreeShipping = true
      shippingPrice = 0
      shippingReason = 'SALE_PROGRAM_BENEFIT'
    }
    // Priority 2: Check quantity threshold (10+ items)
    else if (enhancedOrderItems.reduce((sum, item) => sum + item.quantity, 0) >= 10) {
      hasFreeShipping = true
      shippingPrice = 0
      shippingReason = 'QUANTITY_THRESHOLD'
    }
    // Priority 3: Check subtotal threshold ($50+)
    else if (itemsPrice >= 50) {
      hasFreeShipping = true
      shippingPrice = 0
      shippingReason = 'SUBTOTAL_THRESHOLD'
    }
    // Priority 4: Distance-based calculation (if city provided)
    else if (shippingAddress?.city) {
      try {
        const isCOD = paymentMethod === 'COD' || paymentMethod === 'cod'
        const shippingResult = ShippingService.calculateShippingFee(
          shippingAddress.city,
          hasFreeShipping,
          false // isExpress
        )

        shippingPrice = shippingResult.fee
        shippingReason = shippingResult.reason || 'DISTANCE_BASED'

        // Apply COD surcharge
        if (isCOD && shippingPrice > 0) {
          shippingPrice += 1.5
          shippingReason = 'DISTANCE_BASED_COD'
        }
      } catch (error) {
        console.error('Error calculating distance-based shipping:', error)
        // Fallback to standard rate
        shippingPrice = paymentMethod === 'COD' || paymentMethod === 'cod' ? 6.5 : 5
        shippingReason = 'FALLBACK_ERROR'
      }
    }
    // Priority 5: COD surcharge (no city provided)
    else if (paymentMethod === 'COD' || paymentMethod === 'cod') {
      shippingPrice = 6.5 // $5 base + $1.5 COD surcharge
      shippingReason = 'COD_SURCHARGE'
    }
    // Fallback: Standard rate
    else {
      shippingPrice = 5
      shippingReason = 'STANDARD_RATE'
    }

    console.log(`[ORDER] Shipping calculation: $${shippingPrice} (${shippingReason}) for city: ${shippingAddress?.city || 'N/A'}`)

    const totalPrice = itemsPrice + taxPrice + shippingPrice - totalDiscount

    // Get shipping details for tracking
    const shippingInfo = ShippingService.calculateShippingFee(
      shippingAddress.city,
      hasFreeShipping,
      false
    )

    const order = new Order({
      user: req.user._id,
      orderItems: enhancedOrderItems,
      shippingAddress,
      paymentMethod,
      appliedPrograms,
      couponProgram,
      couponCode,
      couponDiscount,
      note,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      totalDiscount,
      // Add tracking fields
      shippingZone: shippingInfo.zone,
      shippingDistance: shippingInfo.distance,
    })

    // Create initial timeline
    order.timeline = OrderTrackingService.createInitialTimeline(order)

    const createdOrder = await order.save()

    // Update stock for all items
    await createdOrder.updateStock()

    // Send notifications
    const io = req.app.get("io")

    // Emit Socket.IO event for new order
    if (io) {
      realtimeService.emitOrderUpdate(
        createdOrder._id,
        req.user._id.toString(),
        {
          status: 'created',
          orderStatus: createdOrder.status,
          totalPrice: createdOrder.totalPrice,
          message: 'Order created successfully'
        }
      )

      // Notify admin of new order
      await NotificationService.notifyAdminNewOrder(io, createdOrder)

      // Emit to admin namespace - new order event
      io.of('/admin').to('admin:orders').emit('admin:order:new', {
        success: true,
        data: createdOrder,
        timestamp: new Date()
      });

      // Notify admin dashboard - real-time update
      const AdminDashboardService = require('../services/adminDashboard.service');
      await AdminDashboardService.invalidateCache();

      const updatedStats = await AdminDashboardService.getDashboardStats(true);
      io.of('/admin').to('admin:dashboard').emit('admin:dashboard:update', {
        success: true,
        data: updatedStats,
        updateType: 'new_order',
        trigger: 'order_created',
        timestamp: new Date()
      });
    }

    res.status(201).json(createdOrder)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)

    if (order) {
      if (order.status === "PENDING") {
        order.status = "CONFIRMED"
      } else if (order.status === "CONFIRMED") {
        order.status = "PAID"
        order.paidAt = Date.now()

        order.paymentResult = {
          id: req.body.id,
          status: req.body.status,
          update_time: req.body.update_time,
          email_address: req.body.payer?.email_address,
          payUrl: req.body.payUrl,
          transactionId: req.body.transactionId,
        }
      }

      const updatedOrder = await order.save()

      // Emit Socket.IO event for payment update
      realtimeService.emitOrderUpdate(
        updatedOrder._id,
        updatedOrder.user.toString(),
        {
          status: 'paid',
          orderStatus: updatedOrder.status,
          message: 'Payment confirmed successfully',
          paidAt: updatedOrder.paidAt
        }
      )

      res.json(updatedOrder)
    } else {
      res.status(404).json({ message: "Order not found" })
    }
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (order.status === "DELIVERED") {
      return res.status(400).json({ success: false, message: "Cannot cancel delivered order" });
    }

    if (order.status === "CANCELLED") {
      return res.status(400).json({ success: false, message: "Order already cancelled" });
    }

    order.status = "CANCELLED";
    const updatedOrder = await order.save();

    // Emit Socket.IO event for order cancellation
    realtimeService.emitOrderUpdate(
      updatedOrder._id,
      updatedOrder.user.toString(),
      {
        status: 'cancelled',
        orderStatus: updatedOrder.status,
        message: 'Order has been cancelled',
        cancelReason: req.body.reason || 'User requested cancellation'
      }
    )

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order: updatedOrder,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

/**
 * Get order tracking information
 */
const getOrderTracking = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Verify user owns this order (or is admin)
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this order",
      });
    }

    // Get destination coordinates (use ShippingService PROVINCES data)
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

    // Create tracking data
    const trackingData = OrderTrackingService.createTrackingData(order, destinationCoords);

    res.status(200).json({
      success: true,
      tracking: trackingData,
    });
  } catch (error) {
    console.error("Get tracking error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get tracking information",
    });
  }
};

/**
 * Get order timeline
 */
const getOrderTimeline = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('timeline.updatedBy', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Verify user owns this order (or is admin)
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this order",
      });
    }

    res.status(200).json({
      success: true,
      timeline: order.timeline || [],
      currentStatus: order.status,
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.estimatedDeliveryDate,
    });
  } catch (error) {
    console.error("Get timeline error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get order timeline",
    });
  }
};

/**
 * User cancel order (PENDING only)
 */
const userCancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Verify user owns this order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this order",
      });
    }

    // Only PENDING orders can be cancelled by user
    if (order.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status ${order.status}. Please contact support.`,
      });
    }

    order.status = "CANCELLED";
    order.cancellationReason = reason || "Cancelled by customer";
    order.cancelledBy = req.user._id;
    order.cancelledAt = new Date();

    // Add to timeline if exists
    if (order.timeline) {
      OrderTrackingService.addTimelineEvent(
        order.timeline,
        "CANCELLED",
        null,
        reason || "Cancelled by customer",
        req.user._id
      );
    }

    await order.save();

    // Send notification
    const io = req.app.get("io");
    if (io) {
      await NotificationService.notifyOrderCancelled(
        io,
        req.user._id,
        order,
        reason || "Cancelled by customer"
      );

      // Notify admin
      await NotificationService.notifyAdminNewOrder(io, order);

      io.to(`order:${order._id}`).emit("order:cancelled", {
        orderId: order._id,
        reason: reason || "Cancelled by customer",
        cancelledAt: order.cancelledAt,
      });
    }

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("User cancel order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
    });
  }
};

/**
 * Reorder (create new order from existing order)
 */
const reorderOrder = async (req, res) => {
  try {
    const originalOrder = await Order.findById(req.params.id)
      .populate('orderItems.product')
      .populate('orderItems.bundle');

    if (!originalOrder) {
      return res.status(404).json({
        success: false,
        message: "Original order not found",
      });
    }

    // Verify user owns this order
    if (originalOrder.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to reorder this order",
      });
    }

    // Check product availability and stock
    const unavailableItems = [];
    for (const item of originalOrder.orderItems) {
      if (item.product) {
        const product = await Product.findById(item.product._id);
        if (!product || product.countInStock < item.quantity) {
          unavailableItems.push(item.name);
        }
      }
    }

    if (unavailableItems.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Some items are no longer available",
        unavailableItems,
      });
    }

    // Use original shipping address or allow override
    const shippingAddress = req.body.shippingAddress || originalOrder.shippingAddress;

    // Prepare order items
    const orderItems = originalOrder.orderItems.map(item => ({
      name: item.name,
      quantity: item.quantity,
      image: item.image,
      price: item.product?.price || item.price,
      originalPrice: item.product?.price || item.price,
      product: item.product?._id,
      bundle: item.bundle?._id,
    }));

    // Create new order (reuse createOrder logic)
    req.body = {
      orderItems,
      shippingAddress,
      paymentMethod: req.body.paymentMethod || originalOrder.paymentMethod,
      note: req.body.note || "Reordered from order #" + originalOrder._id.toString().slice(-8),
    };

    // Call createOrder logic
    return createOrder(req, res);

  } catch (error) {
    console.error("Reorder error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reorder",
    });
  }
};

module.exports = {
  getAllOrders,
  createOrder,
  getOrderById,
  updateOrderToDelivery,
  getMyOrders,
  updateOrderToPaid,
  cancelOrder,
  getOrderTracking,
  getOrderTimeline,
  userCancelOrder,
  reorderOrder,
}