import { ref, computed } from 'vue'
import { useSocket } from './useSocket'
import Swal from 'sweetalert2'

export function useNotifications() {
    const { socket, connected } = useSocket()
    const notifications = ref([])
    const isListening = ref(false)

    // Computed
    const unreadCount = computed(() =>
        notifications.value.filter(n => !n.read).length
    )

    const hasUnread = computed(() => unreadCount.value > 0)

    const setupNotificationListener = () => {
        if (isListening.value) {
            console.log('[Notifications] Already listening')
            return
        }

        if (!connected.value) {
            console.warn('[Notifications] Socket not connected')
            return
        }

        // Listen for general notifications
        socket.on('notification', handleNotification)

        // Listen for order updates
        socket.on('order:updated', handleOrderUpdate)

        // Listen for flash sale stock updates
        socket.on('flash_sale:stock_updated', handleFlashSaleUpdate)

        // Listen for cart sync
        socket.on('cart:updated', handleCartUpdate)

        isListening.value = true
        console.log('[Notifications] Listeners setup complete')
    }

    /**
     * Remove notification listeners
     */
    const removeListeners = () => {
        socket.off('notification')
        socket.off('order:updated')
        socket.off('flash_sale:stock_updated')
        socket.off('cart:updated')
        isListening.value = false
        console.log('[Notifications] Listeners removed')
    }

    /**
     * Handle incoming notification
     */
    const handleNotification = (notification) => {
        console.log('[Notifications] Received:', notification)

        // Add to notifications list
        notifications.value.unshift({
            ...notification,
            read: false,
            receivedAt: new Date(),
        })

        // Show toast notification
        showNotificationToast(notification)

        // Keep only last 50 notifications
        if (notifications.value.length > 50) {
            notifications.value = notifications.value.slice(0, 50)
        }
    }

    /**
     * Handle order update notification
     */
    const handleOrderUpdate = (data) => {
        console.log('[Notifications] Order update:', data)

        showOrderUpdateToast(data)

        // Add to notifications
        handleNotification({
            type: 'order',
            title: 'Order Update',
            message: `Order #${data.orderId} status: ${data.status}`,
            data: data,
        })
    }

    /**
     * Handle flash sale stock update
     */
    const handleFlashSaleUpdate = (data) => {
        console.log('[Notifications] Flash sale update:', data)

        // Only show if stock is low
        if (data.stock < 10) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'warning',
                title: 'Low Stock Alert',
                text: `Only ${data.stock} items left!`,
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            })
        }
    }

    /**
     * Handle cart update (sync across devices)
     */
    const handleCartUpdate = (data) => {
        console.log('[Notifications] Cart updated:', data)
        // Cart store will handle this via its own listener
    }

    /**
     * Show notification toast
     */
    const showNotificationToast = (notification) => {
        const iconMap = {
            success: 'success',
            error: 'error',
            warning: 'warning',
            info: 'info',
            order: 'success',
            product: 'info',
        }

        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: iconMap[notification.type] || 'info',
            title: notification.title || 'Notification',
            text: notification.message,
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('click', () => {
                    // Mark as read on click
                    markAsRead(notification.id)
                    Swal.close()
                })
            },
        })
    }

    /**
     * Show order update toast
     */
    const showOrderUpdateToast = (data) => {
        const statusIcons = {
            pending: 'info',
            processing: 'info',
            shipped: 'success',
            delivered: 'success',
            cancelled: 'error',
        }

        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: statusIcons[data.status] || 'info',
            title: 'Order Update',
            text: `Order #${data.orderId} is now ${data.status}`,
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true,
        })
    }

    /**
     * Mark notification as read
     */
    const markAsRead = (notificationId) => {
        const notification = notifications.value.find(n => n.id === notificationId)
        if (notification) {
            notification.read = true
        }
    }

    /**
     * Mark all notifications as read
     */
    const markAllAsRead = () => {
        notifications.value.forEach(n => n.read = true)
    }

    /**
     * Clear all notifications
     */
    const clearAll = () => {
        notifications.value = []
    }

    /**
     * Remove specific notification
     */
    const removeNotification = (notificationId) => {
        const index = notifications.value.findIndex(n => n.id === notificationId)
        if (index !== -1) {
            notifications.value.splice(index, 1)
        }
    }

    return {
        // State
        notifications,
        unreadCount,
        hasUnread,
        isListening,

        // Methods
        setupNotificationListener,
        removeListeners,
        markAsRead,
        markAllAsRead,
        clearAll,
        removeNotification,
    }
}
