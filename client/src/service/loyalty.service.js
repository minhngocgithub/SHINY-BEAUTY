import axios from "axios"
import axiosApiInstance from "../../utils/api"

export const getLoyaltyDashboard = async () => {
    try {
        const response = await axiosApiInstance.get('/loyalty/dashboard')
        return response
    } catch (error) {
        console.error('Get loyalty dashboard error:', error)
        throw error
    }
}

export const getPointsHistory = async (page = 1, limit = 20) => {
    try {
        const response = await axiosApiInstance.get('/loyalty/history', {
            params: { page, limit }
        })
        return response
    } catch (error) {
        console.error('Get points history error:', error)
        throw error
    }
}

export const calculatePointsValue = (points) => {
    // 1 point = $1 USD
    return points
}

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount)
}
export const formatNumber = (number) => {
    return new Intl.NumberFormat('en-US').format(number)
}

export const getTierColor = (tier) => {
    const colors = {
        NEW_CUSTOMER: {
            bg: 'bg-gray-100 dark:bg-gray-700',
            text: 'text-gray-700 dark:text-gray-300',
            border: 'border-gray-300 dark:border-gray-600',
            badge: 'bg-gray-500',
            gradient: 'from-gray-400 to-gray-600'
        },
        REGULAR: {
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            text: 'text-blue-700 dark:text-blue-400',
            border: 'border-blue-300 dark:border-blue-600',
            badge: 'bg-blue-500',
            gradient: 'from-blue-400 to-blue-600'
        },
        VIP: {
            bg: 'bg-purple-50 dark:bg-purple-900/20',
            text: 'text-purple-700 dark:text-purple-400',
            border: 'border-purple-300 dark:border-purple-600',
            badge: 'bg-purple-500',
            gradient: 'from-purple-400 to-purple-600'
        },
        PLATINUM: {
            bg: 'bg-gradient-to-r from-gray-700 to-gray-900',
            text: 'text-white',
            border: 'border-gray-700',
            badge: 'bg-gray-800',
            gradient: 'from-gray-700 to-gray-900'
        }
    }
    return colors[tier] || colors.NEW_CUSTOMER
}

export const getTierIcon = (tier) => {
    const icons = {
        NEW_CUSTOMER: '🌱',
        REGULAR: '⭐',
        VIP: '👑',
        PLATINUM: '💎'
    }
    return icons[tier] || '🌱'
}
export const getTierName = (tier) => {
    const names = {
        NEW_CUSTOMER: 'New Customer',
        REGULAR: 'Regular Customer',
        VIP: 'VIP Customer',
        PLATINUM: 'Platinum Elite'
    }
    return names[tier] || 'New Customer'
}

export const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

export const formatDateTime = (date) => {
    if (!date) return 'N/A'
    return new Intl.DateTimeFormat('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date))
}
export const validateLoyaltyPoints = (pointsToUse, availablePoints, orderTotal) => {
    if (pointsToUse < 0) {
        return {
            valid: false,
            error: 'Cannot use negative points'
        }
    }

    if (pointsToUse > availablePoints) {
        return {
            valid: false,
            error: `You only have ${availablePoints} loyalty points`
        }
    }

    const maxPointsByOrder = Math.floor(orderTotal / 1000)
    if (pointsToUse > maxPointsByOrder) {
        return {
            valid: false,
            error: `Maximum ${maxPointsByOrder} points can be used for this order`
        }
    }

    return { valid: true }
}
