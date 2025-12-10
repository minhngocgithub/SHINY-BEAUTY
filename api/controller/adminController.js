const User = require('../models/user.models')
const Order = require('../models/order.models')

// Get many users with stats
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password')

        // Enrich users with order stats
        const enrichedUsers = await Promise.all(users.map(async (user) => {
            // Get order statistics
            const orderStats = await Order.aggregate([
                {
                    $match: {
                        user: user._id,
                        status: { $ne: "CANCELLED" }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        totalSpent: { $sum: "$totalPrice" }
                    }
                }
            ])

            const stats = orderStats[0] || { totalOrders: 0, totalSpent: 0 }

            return {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar,
                isAdmin: user.isAdmin,
                isBanned: user.isBanned,
                loyaltyTier: user.loyaltyProfile?.tier || 'Bronze',
                loyaltyPoints: user.loyaltyProfile?.points || 0,
                totalOrders: stats.totalOrders,
                totalSpent: stats.totalSpent,
                createdAt: user.createdAt || user.createAt,
                lastLogin: user.lastLogin
            }
        }))

        return res.status(200).json({
            count: enrichedUsers.length,
            users: enrichedUsers
        })
    } catch (error) {
        console.error('Get users error:', error)
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        })
    }
}
// Get a user
const getUser = async (req, res) => {
    const user = await User.findById(req.params.id).select('-password')
    if (user) {
        return res.status(200).json(user)
    } else {
        res.status(404).json('User not found.')
    }
}
// Update user
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            })
        }

        user.name = req.body.name || user.name
        user.email = req.body.email || user.email
        user.isAdmin = req.body.isAdmin === undefined ? user.isAdmin : req.body.isAdmin
        user.isBanned = req.body.isBanned === undefined ? user.isBanned : req.body.isBanned

        const updatedUser = await user.save()

        res.status(200).json({
            success: true,
            user: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                avatar: updatedUser.avatar,
                isAdmin: updatedUser.isAdmin,
                isBanned: updatedUser.isBanned
            }
        })
    } catch (error) {
        console.error('Update user error:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to update user'
        })
    }
}
// Delete user
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            })
        }

        await User.findByIdAndDelete(req.params.id)

        res.status(200).json({
            success: true,
            message: 'User deleted successfully.'
        })
    } catch (error) {
        console.error('Delete user error:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to delete user'
        })
    }
}
// Product 

module.exports = {
    getUsers,
    getUser,
    updateUser,
    deleteUser
}