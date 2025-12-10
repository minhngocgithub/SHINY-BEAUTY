const User = require('../models/user.models')
const Order = require('../models/order.models')
const LoyaltyService = require('../utils/loyalty.utils')

// GET /api/v1/loyalty/dashboard
const getLoyaltyDashboard = async (req, res) => {
    try {
        const userId = req.user._id
        const dashboard = await LoyaltyService.getLoyaltyDashboard(userId)

        if (!dashboard) {
            return res.status(404).json({
                success: false,
                message: 'Loyalty dashboard not found'
            })
        }

        res.status(200).json({
            success: true,
            dashboard
        })
    } catch (error) {
        console.error('Get loyalty dashboard error:', error)
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get loyalty dashboard'
        })
    }
}

const getPointsHistory = async (req, res) => {
    try {
        const userId = req.user._id
        const { page = 1, limit = 20 } = req.query

        // Get orders with loyalty points
        const orders = await Order.find({
            user: userId,
            $or: [
                { loyaltyPointsEarned: { $gt: 0 } },
                { loyaltyPointsUsed: { $gt: 0 } }
            ]
        })
            .select('orderNumber loyaltyPointsEarned loyaltyPointsUsed totalPrice createdAt status')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))

        const total = await Order.countDocuments({
            user: userId,
            $or: [
                { loyaltyPointsEarned: { $gt: 0 } },
                { loyaltyPointsUsed: { $gt: 0 } }
            ]
        })

        const history = orders.map(order => ({
            orderId: order._id,
            orderNumber: order.orderNumber,
            date: order.createdAt,
            earned: order.loyaltyPointsEarned || 0,
            used: order.loyaltyPointsUsed || 0,
            orderTotal: order.totalPrice,
            status: order.status
        }))

        res.status(200).json({
            success: true,
            history,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('Get points history error:', error)
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get points history'
        })
    }
}

// GET /api/v1/loyalty/benefits
const getTierBenefits = async (req, res) => {
    try {
        const userId = req.user._id
        const user = await User.findById(userId).select('loyaltyProfile')

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        const currentTier = user.loyaltyProfile.tier
        const allTiers = ['NEW_CUSTOMER', 'REGULAR', 'VIP', 'PLATINUM']

        const benefitsComparison = allTiers.map(tier => {
            const benefits = LoyaltyService.getTierBenefits(tier)
            return {
                tier,
                name: benefits.name,
                isCurrent: tier === currentTier,
                benefits: {
                    discountRate: `${(benefits.discountRate * 100).toFixed(0)}%`,
                    freeShippingThreshold: benefits.freeShippingThreshold === 0
                        ? 'Free shipping on all orders'
                        : `Free shipping from $${benefits.freeShippingThreshold}`,
                    pointsMultiplier: `${benefits.pointsMultiplier}x points`,
                    earlyAccess: benefits.earlyAccess,
                    birthdayGift: benefits.birthdayGift,
                    exclusiveProducts: benefits.exclusiveProducts || false,
                    conciergeService: benefits.conciergeService || false
                }
            }
        })

        res.status(200).json({
            success: true,
            currentTier,
            benefits: benefitsComparison
        })
    } catch (error) {
        console.error('Get tier benefits error:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to get tier benefits'
        })
    }
}

// POST /api/v1/loyalty/calculate-tier
const calculateAndUpdateTier = async (req, res) => {
    try {
        const userId = req.user._id
        const updatedUser = await LoyaltyService.updateUserTier(userId)

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        const benefits = LoyaltyService.getTierBenefits(updatedUser.loyaltyProfile.tier)
        const nextTierInfo = LoyaltyService.getNextTierInfo(updatedUser)

        res.status(200).json({
            success: true,
            message: 'Tier updated successfully',
            tier: {
                current: updatedUser.loyaltyProfile.tier,
                name: benefits.name,
                nextTier: nextTierInfo
            }
        })
    } catch (error) {
        console.error('Calculate tier error:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to calculate tier'
        })
    }
}

// GET /api/v1/loyalty/estimate-points
const estimatePoints = async (req, res) => {
    try {
        const userId = req.user._id
        const { orderAmount } = req.query

        if (!orderAmount || orderAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order amount'
            })
        }

        const user = await User.findById(userId).select('loyaltyProfile')
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        const pointsToEarn = LoyaltyService.calculatePointsToEarn(user, parseFloat(orderAmount))
        const discount = LoyaltyService.calculateDiscount(user, parseFloat(orderAmount))
        const benefits = LoyaltyService.getTierBenefits(user.loyaltyProfile.tier)

        res.status(200).json({
            success: true,
            estimate: {
                orderAmount: parseFloat(orderAmount),
                pointsToEarn,
                tierDiscount: discount,
                pointsMultiplier: benefits.pointsMultiplier,
                currentPoints: user.loyaltyProfile.points,
                pointsAfterPurchase: user.loyaltyProfile.points + pointsToEarn
            }
        })
    } catch (error) {
        console.error('Estimate points error:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to estimate points'
        })
    }
}

// GET /api/v1/loyalty/pending-rewards
const getPendingRewards = async (req, res) => {
    try {
        const userId = req.user._id
        const user = await User.findById(userId).select('loyaltyProfile')

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        // Get last login time from user or use a reasonable default (7 days ago)
        const lastLoginTime = req.query.lastLoginTime
            ? new Date(req.query.lastLoginTime)
            : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

        // Find delivered orders since last login
        const deliveredOrders = await Order.find({
            user: userId,
            status: 'DELIVERED',
            deliveredAt: { $gte: lastLoginTime }
        })
            .select('orderNumber totalPrice loyaltyPointsEarned deliveredAt')
            .sort({ deliveredAt: -1 })

        // Calculate total points earned
        const totalPointsEarned = deliveredOrders.reduce((sum, order) =>
            sum + (order.loyaltyPointsEarned || 0), 0
        )

        // Check if tier has been upgraded
        const previousTier = req.query.previousTier || 'NEW_CUSTOMER'
        const currentTier = user.loyaltyProfile.tier
        const tierUpgraded = previousTier !== currentTier

        let tierUpgradeInfo = null
        if (tierUpgraded) {
            const oldBenefits = LoyaltyService.getTierBenefits(previousTier)
            const newBenefits = LoyaltyService.getTierBenefits(currentTier)
            const nextTierInfo = LoyaltyService.getNextTierInfo(user)

            tierUpgradeInfo = {
                from: {
                    tier: previousTier,
                    name: oldBenefits.name
                },
                to: {
                    tier: currentTier,
                    name: newBenefits.name
                },
                newBenefits: {
                    discountRate: newBenefits.discountRate,
                    freeShippingThreshold: newBenefits.freeShippingThreshold,
                    pointsMultiplier: newBenefits.pointsMultiplier,
                    earlyAccess: newBenefits.earlyAccess,
                    birthdayGift: newBenefits.birthdayGift,
                    exclusiveProducts: newBenefits.exclusiveProducts || false,
                    conciergeService: newBenefits.conciergeService || false
                },
                nextTier: nextTierInfo
            }
        }

        res.status(200).json({
            success: true,
            pendingRewards: {
                hasNewRewards: deliveredOrders.length > 0 || tierUpgraded,
                deliveredOrders: deliveredOrders.map(order => ({
                    orderNumber: order.orderNumber,
                    totalPrice: order.totalPrice,
                    pointsEarned: order.loyaltyPointsEarned,
                    deliveredAt: order.deliveredAt
                })),
                totalPointsEarned,
                totalOrders: deliveredOrders.length,
                tierUpgraded,
                tierUpgradeInfo,
                currentPoints: user.loyaltyProfile.points,
                currentTier: {
                    tier: currentTier,
                    name: LoyaltyService.getTierBenefits(currentTier).name
                }
            }
        })
    } catch (error) {
        console.error('Get pending rewards error:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to get pending rewards'
        })
    }
}

module.exports = {
    getLoyaltyDashboard,
    getPointsHistory,
    getTierBenefits,
    calculateAndUpdateTier,
    estimatePoints,
    getPendingRewards
}
