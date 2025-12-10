import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { io } from 'socket.io-client';
import {
    getNotificationsApi,
    markNotificationAsReadApi,
    markAllNotificationsAsReadApi,
    getNotificationPreferencesApi,
    updateNotificationPreferencesApi,
    deleteNotificationApi
} from '../service/notification.service';

export const useNotificationStore = defineStore('notification', () => {
    // State
    const notifications = ref([]);
    const preferences = ref({
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
    });
    const loading = ref(false);
    const error = ref(null);
    const socket = ref(null);

    // Computed
    const unreadCount = computed(() => {
        return notifications.value.filter(n => !n.read).length;
    });

    const hasUnread = computed(() => unreadCount.value > 0);

    const sortedNotifications = computed(() => {
        return [...notifications.value].sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    });

    const unreadNotifications = computed(() => {
        return sortedNotifications.value.filter(n => !n.read);
    });

    const readNotifications = computed(() => {
        return sortedNotifications.value.filter(n => n.read);
    });

    // Actions
    const fetchNotifications = async (limit = 20) => {
        try {
            loading.value = true;
            error.value = null;

            const response = await getNotificationsApi(limit);

            if (response.data.success) {
                notifications.value = response.data.notifications || [];
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to fetch notifications';
            console.error('Fetch notifications error:', err);
        } finally {
            loading.value = false;
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const response = await markNotificationAsReadApi(notificationId);

            if (response.data.success) {
                const notification = notifications.value.find(n => n.id === notificationId);
                if (notification) {
                    notification.read = true;
                }
            }
        } catch (err) {
            console.error('Mark as read error:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            const response = await markAllNotificationsAsReadApi();

            if (response.data.success) {
                notifications.value.forEach(n => {
                    n.read = true;
                });
            }
        } catch (err) {
            console.error('Mark all as read error:', err);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await deleteNotificationApi(notificationId);
            notifications.value = notifications.value.filter(n => n.id !== notificationId);
        } catch (err) {
            console.error('Delete notification error:', err);
        }
    };

    const fetchPreferences = async () => {
        try {
            loading.value = true;
            error.value = null;

            const response = await getNotificationPreferencesApi();

            if (response.data.success) {
                preferences.value = response.data.preferences;
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to fetch preferences';
            console.error('Fetch preferences error:', err);
        } finally {
            loading.value = false;
        }
    };

    const updatePreferences = async (newPreferences) => {
        try {
            loading.value = true;
            error.value = null;

            const response = await updateNotificationPreferencesApi(newPreferences);

            if (response.data.success) {
                preferences.value = response.data.preferences;
                return true;
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to update preferences';
            console.error('Update preferences error:', err);
            return false;
        } finally {
            loading.value = false;
        }
    };

    const addNotification = (notification) => {
        // Add to beginning of array (newest first)
        notifications.value.unshift({
            ...notification,
            read: false,
            createdAt: notification.createdAt || new Date().toISOString()
        });

        // Show browser notification if permission granted
        if (preferences.value.push?.orderUpdates && Notification.permission === 'granted') {
            new Notification(notification.title || 'New Notification', {
                body: notification.message || notification.body,
                icon: notification.icon || '/logo.png',
                badge: '/badge.png'
            });
        }

        // Play notification sound
        playNotificationSound();
    };

    const playNotificationSound = () => {
        try {
            const audio = new Audio('/notification.mp3');
            audio.volume = 0.3;
            audio.play().catch(err => console.log('Audio play prevented:', err));
        } catch (err) {
            console.error('Sound play error:', err);
        }
    };

    // Socket.IO Real-time Notifications
    const connectNotificationSocket = (userId) => {
        if (socket.value?.connected) {
            return;
        }

        const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:4000';

        socket.value = io(socketUrl, {
            auth: {
                token: localStorage.getItem('accessToken')
            },
            transports: ['websocket', 'polling']
        });

        // Listen for new notifications
        socket.value.on('notification:new', (data) => {
            console.log('New notification received:', data);
            addNotification(data);
        });

        // Listen for price drop alerts
        socket.value.on('notification:price-drop', (data) => {
            console.log('Price drop notification:', data);
            addNotification({
                id: Date.now().toString(),
                type: 'price_drop',
                title: '💰 Price Drop Alert!',
                message: `${data.productName} is now ${data.discount}% off!`,
                data: {
                    productId: data.productId,
                    oldPrice: data.oldPrice,
                    newPrice: data.newPrice
                },
                createdAt: data.timestamp
            });
        });

        // Order updates
        socket.value.on('order:status_updated', (data) => {
            if (data.success && data.data) {
                addNotification({
                    id: Date.now().toString(),
                    type: 'order_update',
                    title: '📦 Order Update',
                    message: data.data.message,
                    data: {
                        orderId: data.data.orderId,
                        status: data.data.status
                    },
                    createdAt: data.data.timestamp
                });
            }
        });

        // Delivery reminders
        socket.value.on('order:delivery_reminder', (data) => {
            if (data.success && data.data) {
                addNotification({
                    id: Date.now().toString(),
                    type: 'delivery_reminder',
                    title: '🚚 Delivery Reminder',
                    message: data.data.message,
                    data: {
                        orderId: data.data.orderId,
                        estimatedDelivery: data.data.estimatedDelivery
                    },
                    createdAt: data.data.timestamp || new Date().toISOString()
                });
            }
        });

        socket.value.on('connect', () => {
            console.log('Notification socket connected');
        });

        socket.value.on('disconnect', () => {
            console.log('Notification socket disconnected');
        });

        socket.value.on('connect_error', (error) => {
            console.error('Notification socket error:', error);
        });
    };

    const disconnectNotificationSocket = () => {
        if (socket.value) {
            socket.value.disconnect();
            socket.value = null;
        }
    };

    // Request browser notification permission
    const requestNotificationPermission = async () => {
        if ('Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        return Notification.permission === 'granted';
    };

    return {
        // State
        notifications,
        preferences,
        loading,
        error,

        // Computed
        unreadCount,
        hasUnread,
        sortedNotifications,
        unreadNotifications,
        readNotifications,

        // Actions
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        fetchPreferences,
        updatePreferences,
        addNotification,
        connectNotificationSocket,
        disconnectNotificationSocket,
        requestNotificationPermission,
        playNotificationSound
    };
});
