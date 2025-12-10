import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getLoyaltyDashboard, getPointsHistory, getPendingRewards } from '../service/loyalty.service'
import Swal from 'sweetalert2'

export const useLoyaltyStore = defineStore('loyalty', () => {
    // State
    const dashboard = ref(null)
    const history = ref([])
    const historyPagination = ref({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
    })
    const loading = ref(false)
    const historyLoading = ref(false)
    const error = ref(null)

    // Computed - Dashboard
    const currentTier = computed(() => dashboard.value?.currentTier || null)
    const tierName = computed(() => currentTier.value?.name || 'New Customer')
    const points = computed(() => dashboard.value?.points || 0)
    const totalSpent = computed(() => dashboard.value?.totalSpent || 0)
    const totalOrders = computed(() => dashboard.value?.totalOrders || 0)
    const averageOrderValue = computed(() => dashboard.value?.averageOrderValue || 0)
    const nextTier = computed(() => dashboard.value?.nextTier || null)
    const benefits = computed(() => currentTier.value?.benefits || null)
    const memberSince = computed(() => dashboard.value?.memberSince || null)
    const lastPurchase = computed(() => dashboard.value?.lastPurchase || null)

    // Computed - Tier Checks
    const isNewCustomer = computed(() => currentTier.value?.tier === 'NEW_CUSTOMER')
    const isRegular = computed(() => currentTier.value?.tier === 'REGULAR')
    const isVIP = computed(() => currentTier.value?.tier === 'VIP')
    const isPlatinum = computed(() => currentTier.value?.tier === 'PLATINUM')

    // Computed - Progress to Next Tier
    const progressToNextTier = computed(() => {
        if (!nextTier.value) return null
        return {
            nextTierName: nextTier.value.name,
            spendingProgress: nextTier.value.progressSpending || 0,
            ordersProgress: nextTier.value.progressOrders || 0,
            requiredSpending: nextTier.value.requiredSpending || 0,
            requiredOrders: nextTier.value.requiredOrders || 0
        }
    })

    // Computed - Overall Progress Percentage
    const overallProgress = computed(() => {
        if (!progressToNextTier.value) return 100 // Already at max tier
        const { spendingProgress, ordersProgress } = progressToNextTier.value
        return Math.min(100, Math.round((spendingProgress + ordersProgress) / 2))
    })

    // Computed - Points Value
    const pointsValue = computed(() => points.value * 1000)

    // Actions
    const fetchDashboard = async () => {
        try {
            loading.value = true
            error.value = null
            const response = await getLoyaltyDashboard()
            if (response.data.success) {
                dashboard.value = response.data.dashboard
                return dashboard.value
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to fetch loyalty dashboard'
            console.error('Loyalty dashboard error:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const fetchHistory = async (page = 1) => {
        try {
            historyLoading.value = true
            const response = await getPointsHistory(page, historyPagination.value.limit)
            if (response.data.success) {
                history.value = response.data.history
                historyPagination.value = response.data.pagination
                return history.value
            }
        } catch (err) {
            console.error('Loyalty history error:', err)
            throw err
        } finally {
            historyLoading.value = false
        }
    }

    const reset = () => {
        dashboard.value = null
        history.value = []
        historyPagination.value = {
            page: 1,
            limit: 20,
            total: 0,
            pages: 0
        }
        error.value = null
    }

    const checkPendingRewards = async () => {
        try {
            const lastLoginTime = localStorage.getItem('lastLoginTime')
            const previousTier = localStorage.getItem('userTier')

            const response = await getPendingRewards(lastLoginTime, previousTier)

            if (response.data.success && response.data.pendingRewards.hasNewRewards) {
                const rewards = response.data.pendingRewards

                // Show tier upgrade notification first (more important)
                if (rewards.tierUpgraded && rewards.tierUpgradeInfo) {
                    await showTierUpgradeNotification(rewards.tierUpgradeInfo, rewards.currentPoints)
                }

                // Then show points earned from delivered orders
                if (rewards.totalPointsEarned > 0) {
                    await showPointsEarnedNotification(rewards)
                }

                // Update stored tier
                localStorage.setItem('userTier', rewards.currentTier.tier)
            }

            // Update last login time
            localStorage.setItem('lastLoginTime', new Date().toISOString())

        } catch (error) {
            console.error('Failed to check pending rewards:', error)
        }
    }

    const showPointsEarnedNotification = async (rewards) => {
        const ordersText = rewards.deliveredOrders.length === 1
            ? '1 order'
            : `${rewards.deliveredOrders.length} orders`

        await Swal.fire({
            title: '🎉 Congratulations!',
            html: `
                <div class="text-left space-y-4">
                    <p class="text-lg font-semibold text-green-600">
                        You earned <span class="text-2xl font-bold">${rewards.totalPointsEarned}</span> loyalty points!
                    </p>
                    <p class="text-gray-600">
                        From ${ordersText} successfully delivered
                    </p>
                    <div class="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
                        <p class="text-sm text-gray-700 mb-2">💰 Points Value: <strong>$${(rewards.totalPointsEarned * 1000).toLocaleString()}</strong></p>
                        <p class="text-sm text-gray-700">🎁 Current Balance: <strong>${rewards.currentPoints} points</strong></p>
                    </div>
                    <div class="text-sm text-gray-500 mt-2">
                        <p>Recent Orders:</p>
                        <ul class="list-disc list-inside mt-1">
                            ${rewards.deliveredOrders.slice(0, 3).map(order =>
                `<li>${order.orderNumber}: +${order.pointsEarned} points</li>`
            ).join('')}
                        </ul>
                    </div>
                </div>
            `,
            icon: 'success',
            confirmButtonText: 'Awesome!',
            confirmButtonColor: '#10b981',
            showClass: {
                popup: 'animate__animated animate__bounceIn'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOut'
            }
        })
    }

    const showTierUpgradeNotification = async (tierInfo, currentPoints) => {
        const { from, to, newBenefits, nextTier } = tierInfo

        const benefitsList = []
        if (newBenefits.discountRate > 0) {
            benefitsList.push(`💰 ${(newBenefits.discountRate * 100).toFixed(0)}% discount on all orders`)
        }
        if (newBenefits.freeShippingThreshold === 0) {
            benefitsList.push('🚚 Free shipping on ALL orders')
        } else {
            benefitsList.push(`🚚 Free shipping from $${newBenefits.freeShippingThreshold}`)
        }
        benefitsList.push(`⭐ ${newBenefits.pointsMultiplier}x points multiplier`)

        if (newBenefits.earlyAccess) {
            benefitsList.push('🎯 Early access to sales & new products')
        }
        if (newBenefits.birthdayGift) {
            benefitsList.push('🎂 Special birthday gift')
        }
        if (newBenefits.exclusiveProducts) {
            benefitsList.push('👑 Access to exclusive products')
        }
        if (newBenefits.conciergeService) {
            benefitsList.push('🌟 Personal concierge service')
        }

        await Swal.fire({
            title: '🎊 TIER UPGRADE!',
            html: `
                <div class="text-center space-y-6 p-4">
                    <div class="relative">
                        <div class="text-6xl mb-4 animate-bounce">
                            ${getTierIcon(to.tier)}
                        </div>
                        <p class="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
                            Welcome to ${to.name}!
                        </p>
                    </div>
                    
                    <div class="flex items-center justify-center gap-4 my-6">
                        <span class="px-4 py-2 bg-gray-100 rounded-lg text-gray-600 line-through">
                            ${from.name}
                        </span>
                        <span class="text-3xl">→</span>
                        <span class="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold text-lg">
                            ${to.name}
                        </span>
                    </div>

                    <div class="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl text-left">
                        <p class="text-lg font-semibold mb-4 text-purple-800">🎁 Unlocked Benefits:</p>
                        <ul class="space-y-2">
                            ${benefitsList.map(benefit =>
                `<li class="flex items-start gap-2">
                                    <span class="text-green-500 mt-1">✓</span>
                                    <span class="text-gray-700">${benefit}</span>
                                </li>`
            ).join('')}
                        </ul>
                    </div>

                    <div class="bg-blue-50 p-4 rounded-lg">
                        <p class="text-sm text-gray-700">
                            💎 Current Points: <strong>${currentPoints}</strong>
                        </p>
                        ${nextTier ? `
                            <p class="text-sm text-gray-600 mt-2">
                                Next tier: <strong>${nextTier.name}</strong>
                                <br>
                                <span class="text-xs">
                                    (${nextTier.requiredOrders} more orders or $${nextTier.requiredSpending} more spending)
                                </span>
                            </p>
                        ` : '<p class="text-sm text-purple-600 font-semibold mt-2">🏆 You\'ve reached the highest tier!</p>'}
                    </div>

                    <p class="text-sm text-gray-500 italic mt-4">
                        Thank you for your loyalty! Enjoy your exclusive benefits.
                    </p>
                </div>
            `,
            icon: 'success',
            confirmButtonText: 'Explore Benefits',
            confirmButtonColor: '#a855f7',
            width: '700px',
            showClass: {
                popup: 'animate__animated animate__jackInTheBox'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOut'
            },
            backdrop: `
                rgba(147, 51, 234, 0.4)
                left top
                no-repeat
            `
        })
    }

    const getTierIcon = (tier) => {
        const icons = {
            NEW_CUSTOMER: '🌱',
            REGULAR: '⭐',
            VIP: '👑',
            PLATINUM: '💎'
        }
        return icons[tier] || '🌱'
    }

    return {
        // State
        dashboard,
        history,
        historyPagination,
        loading,
        historyLoading,
        error,

        // Computed - Dashboard
        currentTier,
        tierName,
        points,
        totalSpent,
        totalOrders,
        averageOrderValue,
        nextTier,
        benefits,
        memberSince,
        lastPurchase,

        // Computed - Tier Checks
        isNewCustomer,
        isRegular,
        isVIP,
        isPlatinum,

        // Computed - Progress
        progressToNextTier,
        overallProgress,
        pointsValue,

        // Actions
        fetchDashboard,
        fetchHistory,
        reset,
        checkPendingRewards
    }
})
