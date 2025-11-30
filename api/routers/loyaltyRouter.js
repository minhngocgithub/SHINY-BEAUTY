const express = require('express')
const router = express.Router()
const { authenticate } = require('../middleware/auth.middleware')
const {
    getLoyaltyDashboard,
    getPointsHistory
} = require('../controller/loyaltyController')

// All routes require authentication
router.get('/dashboard', authenticate, getLoyaltyDashboard)
router.get('/history', authenticate, getPointsHistory)

module.exports = router
