const logger = require("../config/logger")
const NotificationService = require("../services/notification.service")
const { asyncHandler } = require("../middleware/errorHandler.middleware")

const getNotifications = asyncHandler(async (req, res) => {
    const { limit = 20 } = req.query

    const notifications = await NotificationService.getNotifications(req.user._id, Number.parseInt(limit))

    res.status(200).json({
        success: true,
        count: notifications.length,
        notifications,
    })
})

const markAsRead = asyncHandler(async (req, res) => {
    const { notificationId } = req.params

    await NotificationService.markAsRead(req.user._id, notificationId)

    res.status(200).json({
        success: true,
        message: "Notification marked as read",
    })
})

const markAllAsRead = asyncHandler(async (req, res) => {
    const notifications = await NotificationService.getNotifications(req.user._id)

    for (const notif of notifications) {
        if (!notif.read) {
            await NotificationService.markAsRead(req.user._id, notif.id)
        }
    }

    res.status(200).json({
        success: true,
        message: "All notifications marked as read",
    })
})

const getNotificationPreferences = asyncHandler(async (req, res) => {
    const User = require("../models/user.models")
    const user = await User.findById(req.user._id).select("notificationPreferences")

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        })
    }

    // Initialize default preferences if not set
    const preferences = user.notificationPreferences || {
        email: {
            orderUpdates: true,
            promotions: true,
            newsletter: false,
            productRecommendations: true,
            loyaltyUpdates: true
        },
        push: {
            orderUpdates: true,
            promotions: false,
            productRecommendations: false,
            loyaltyUpdates: true
        }
    }

    res.status(200).json({
        success: true,
        preferences,
    })
})

const updateNotificationPreferences = asyncHandler(async (req, res) => {
    const User = require("../models/user.models")
    const user = await User.findById(req.user._id)

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        })
    }

    // Merge new preferences with existing ones
    user.notificationPreferences = {
        email: {
            ...user.notificationPreferences?.email,
            ...req.body.email,
        },
        push: {
            ...user.notificationPreferences?.push,
            ...req.body.push,
        },
    }

    await user.save()

    res.status(200).json({
        success: true,
        message: "Notification preferences updated successfully",
        preferences: user.notificationPreferences,
    })
})

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    getNotificationPreferences,
    updateNotificationPreferences,
}
