const express = require('express')
const router = express.Router()
const { authenticate } = require('../middleware/auth.middleware')
const {
    getLoyaltyDashboard,
    getPointsHistory,
    getTierBenefits,
    calculateAndUpdateTier,
    estimatePoints,
    getPendingRewards
} = require('../controller/loyaltyController')

// All routes require authentication
router.get('/dashboard', authenticate, getLoyaltyDashboard)
router.get('/history', authenticate, getPointsHistory)
router.get('/benefits', authenticate, getTierBenefits)
router.post('/calculate-tier', authenticate, calculateAndUpdateTier)
router.get('/estimate-points', authenticate, estimatePoints)
router.get('/pending-rewards', authenticate, getPendingRewards)

module.exports = router
