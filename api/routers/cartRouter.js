const express = require('express');
const router = express.Router();
const cartController = require('../controller/cartController');
const { authenticate } = require('../middleware/auth.middleware');
const { cartLimiter } = require('../config/rateLimiter');

// Cart routes with rate limiting
router.post('/add', authenticate, cartLimiter, cartController.addToCard);
router.get('/', authenticate, cartController.getCart);
router.put('/update', authenticate, cartLimiter, cartController.updateCartItem);
router.delete('/remove/:itemId', authenticate, cartLimiter, cartController.removeFromCart);
router.delete('/clear', authenticate, cartLimiter, cartController.clearCart);

module.exports = router;