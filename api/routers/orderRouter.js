const express = require('express')
const router = express.Router()
const orderController = require('../controller/orderController')
const adminOrderController = require('../controller/adminOrderController')
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware')

// User order routes
router.post('/', authenticate, orderController.createOrder)
router.get('/myOrders', authenticate, orderController.getMyOrders)

// Admin order routes (must be before /:id routes to avoid conflicts)
router.get('/all', authenticate, authorizeAdmin, orderController.getAllOrders)
router.get('/admin/pending', authenticate, authorizeAdmin, adminOrderController.getPendingOrders)
router.get('/admin/statistics', authenticate, authorizeAdmin, adminOrderController.getOrderStatistics)
router.post('/admin/:id/confirm', authenticate, authorizeAdmin, adminOrderController.confirmOrder)
router.post('/admin/:id/cancel', authenticate, authorizeAdmin, adminOrderController.cancelOrder)
router.patch('/admin/:id/status', authenticate, authorizeAdmin, adminOrderController.updateOrderStatus)
router.patch('/admin/:id/tracking', authenticate, authorizeAdmin, adminOrderController.updateTracking)
router.patch('/admin/:id/notes', authenticate, authorizeAdmin, adminOrderController.addAdminNotes)
router.put('/:id/deliver', authenticate, authorizeAdmin, orderController.updateOrderToDelivery)

// User order routes with :id parameter (must be after specific routes)
router.get('/:id', authenticate, orderController.getOrderById)
router.get('/:id/tracking', authenticate, orderController.getOrderTracking)
router.get('/:id/timeline', authenticate, orderController.getOrderTimeline)
router.post('/:id/reorder', authenticate, orderController.reorderOrder)
router.put('/:id/cancel', authenticate, orderController.userCancelOrder)
router.put('/:id/pay', authenticate, orderController.updateOrderToPaid)

module.exports = router