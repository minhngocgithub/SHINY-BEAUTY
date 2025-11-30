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

// GET /api/v1/loyalty/history
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
            .select('orderNumber loyaltyPointsEarned loyaltyPointsUsed totalPrice createdAt orderStatus')
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
            orderStatus: order.orderStatus
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

module.exports = {
    getLoyaltyDashboard,
    getPointsHistory
}
