const express = require('express')
const router = express.Router()
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware')
const { paymentLimiter } = require('../config/rateLimiter')
const paymentController = require('../controller/paymentController')

// Payment routes with rate limiting
router.post('/create-order', authenticate, paymentLimiter, paymentController.createOrderWithPayment)
router.post('/stripe/verify', paymentLimiter, paymentController.verifyStripePayment)
router.post('/webhook/stripe', paymentController.handleStripeWebhook); // No rate limit for webhooks
router.post('/webhook/momo', paymentController.handleMoMoWebhook);
router.post('/webhook/zalopay', paymentController.handleZaloPayWebhook);
router.get('/methods', paymentController.getPaymentMethods);
router.get('/status/:orderId', authenticate, paymentController.getPaymentStatus);

module.exports = router