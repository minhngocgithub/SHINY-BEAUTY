import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getLoyaltyDashboard, getPointsHistory } from '../service/loyalty.service'

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
        reset
    }
})
