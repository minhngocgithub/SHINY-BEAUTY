import { defineStore } from "pinia"
import { ref, computed } from 'vue'
import { useAuthStore } from './auth.store'
import {
    getMyOrdersApi,
    getOrderDetailApi,
    createOrderApi,
    cancelOrderApi,
    getOrderTrackingApi
} from '../service/order.service'
import { io } from 'socket.io-client'

export const useOrderStore = defineStore('orderStore', () => {
    const authStore = useAuthStore()

    // State
    const orders = ref([])
    const currentOrder = ref(null)
    const trackingData = ref(null)
    const loading = ref(false)
    const error = ref(null)
    const socket = ref(null)

    // Computed
    const orderCount = computed(() => orders.value.length)

    const pendingOrders = computed(() =>
        orders.value.filter(order => order.status === 'pending')
    )

    const completedOrders = computed(() =>
        orders.value.filter(order => order.status === 'delivered')
    )

    const cancelledOrders = computed(() =>
        orders.value.filter(order => order.status === 'cancelled')
    )

    // Actions
    const fetchMyOrders = async () => {
        try {
            loading.value = true
            error.value = null

            if (!authStore.state.isLoggedIn) {
                orders.value = []
                return
            }
            const response = await getMyOrdersApi()

            if (response.data.success) {
                orders.value = response.data.orders || []
                console.log('Loaded orders with product data:', orders.value)
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to fetch orders'
            console.error('Fetch orders error:', err)
        } finally {
            loading.value = false
        }
    }

    const getOrder = async (orderId) => {
        try {
            loading.value = true
            error.value = null

            const response = await getOrderDetailApi(orderId)

            if (response.data.success) {
                currentOrder.value = response.data.order
                return response.data.order
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to get order'
            console.error('Get order error:', err)
        } finally {
            loading.value = false
        }
    }

    const createOrder = async (orderData) => {
        try {
            loading.value = true
            error.value = null

            const response = await createOrderApi(orderData)

            // Backend returns order directly (status 201) or wrapped in { success: true, order }
            let order = null

            if (response.data.success && response.data.order) {
                // Wrapped format
                order = response.data.order
            } else if (response.data._id || response.data.user) {
                // Direct order object
                order = response.data
            } else {
                throw new Error('Invalid order response format')
            }

            if (order) {
                orders.value.push(order)
                return order
            } else {
                throw new Error('Failed to create order: no order data received')
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to create order'
            console.error('Create order error:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const cancelOrder = async (orderId, reason) => {
        try {
            loading.value = true
            error.value = null

            const response = await cancelOrderApi(orderId, reason)

            if (response.data.success) {
                const orderIndex = orders.value.findIndex(o => o._id === orderId)
                if (orderIndex > -1) {
                    orders.value[orderIndex].status = 'cancelled'
                }
                return response.data.order
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to cancel order'
            console.error('Cancel order error:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    // Tracking Methods
    const fetchOrderById = async (orderId) => {
        try {
            loading.value = true
            error.value = null

            const response = await getOrderDetailApi(orderId)

            if (response.data.success) {
                currentOrder.value = response.data.order
                return response.data.order
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to fetch order'
            console.error('Fetch order error:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const fetchOrderTracking = async (orderId) => {
        try {
            loading.value = true
            error.value = null

            const response = await getOrderTrackingApi(orderId)
            trackingData.value = response.tracking || response
            return trackingData.value
        } catch (err) {
            error.value = err.response?.data?.message || 'Tracking data not available'
            console.error('Fetch tracking error:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    // Socket.IO Real-time Tracking
    const connectOrderSocket = (orderId) => {
        if (socket.value) {
            socket.value.disconnect()
        }

        const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
        socket.value = io(socketUrl, {
            auth: {
                token: localStorage.getItem('accessToken')
            }
        })

        // Listen for order status updates
        socket.value.on(`order:${orderId}:status`, (data) => {
            console.log('Order status updated:', data)
            if (currentOrder.value && currentOrder.value._id === orderId) {
                currentOrder.value.status = data.status
                currentOrder.value.orderStatus = data.status
            }

            // Show browser notification
            if (Notification.permission === 'granted') {
                new Notification('Order Status Updated', {
                    body: `Your order is now ${data.status}`,
                    icon: '/logo.png'
                })
            }
        })

        // Listen for shipper location updates
        socket.value.on(`order:${orderId}:location`, (data) => {
            console.log('Shipper location updated:', data)
            if (trackingData.value) {
                trackingData.value.currentLocation = data.location
                trackingData.value.lastUpdate = new Date().toISOString()
            }
        })

        // Listen for tracking updates
        socket.value.on(`order:${orderId}:tracking`, (data) => {
            console.log('Tracking data updated:', data)
            trackingData.value = { ...trackingData.value, ...data }
        })

        socket.value.on('connect', () => {
            console.log('Socket connected for order tracking')
        })

        socket.value.on('disconnect', () => {
            console.log('Socket disconnected')
        })

        return socket.value
    }

    const disconnectOrderSocket = () => {
        if (socket.value) {
            socket.value.disconnect()
            socket.value = null
        }
    }

    // Request browser notification permission
    const requestNotificationPermission = async () => {
        if ('Notification' in window && Notification.permission === 'default') {
            await Notification.requestPermission()
        }
    }

    return {
        orders,
        currentOrder,
        trackingData,
        loading,
        error,

        orderCount,
        pendingOrders,
        completedOrders,
        cancelledOrders,

        fetchMyOrders,
        getOrder,
        createOrder,
        cancelOrder,
        fetchOrderById,
        fetchOrderTracking,
        connectOrderSocket,
        disconnectOrderSocket,
        requestNotificationPermission
    }
})
