const logger = require("../config/logger")
const NotificationService = require("../services/notification.service")
const { asyncHandler } = require("../middleware/errorHandler.middleware")

const getNotifications = asyncHandler(async (req, res) => {
    const { limit = 20, offset = 0, unreadOnly = false } = req.query

    // Call service with options and normalize result
    const result = await NotificationService.getNotifications(req.user._id, {
        limit: Number.parseInt(limit),
        offset: Number.parseInt(offset),
        unreadOnly: unreadOnly === 'true' || unreadOnly === true
    })

    // result is { notifications: [...], pagination: {...} }
    const notifications = Array.isArray(result.notifications) ? result.notifications : []

    res.status(200).json({
        success: true,
        count: notifications.length,
        notifications,
        pagination: result.pagination || { total: notifications.length, limit: Number.parseInt(limit), offset: Number.parseInt(offset) }
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
    const result = await NotificationService.markAllAsRead(req.user._id)

    if (result && result.success) {
        return res.status(200).json({
            success: true,
            message: 'All notifications marked as read',
            updated: result.updated || 0
        })
    }

    res.status(500).json({
        success: false,
        message: 'Failed to mark all notifications as read'
    })
})

const clearAll = asyncHandler(async (req, res) => {
    const success = await NotificationService.clearAllNotifications(req.user._id)

    if (success) {
        return res.status(200).json({
            success: true,
            message: 'All notifications cleared'
        })
    }

    res.status(500).json({
        success: false,
        message: 'Failed to clear notifications'
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
    clearAll,
    getNotificationPreferences,
    updateNotificationPreferences,
}
