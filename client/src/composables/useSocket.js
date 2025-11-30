import { ref, onMounted, onUnmounted, computed } from 'vue'
import socketService from '../service/socket.service'
import { useAuthStore } from '../store/auth.store'

/**
 * Vue 3 Composable for Socket.IO integration
 * Handles connection lifecycle and state management
 * 
 * @returns {Object} Socket utilities and state
 */
export function useSocket() {
    const connected = ref(false)
    const socketId = ref(null)
    const authStore = useAuthStore()

    /**
     * Initialize socket connection
     */
    const initSocket = () => {
        // Check if socket is enabled via feature flag
        const socketEnabled = import.meta.env.VITE_ENABLE_SOCKET
        if (socketEnabled === 'false' || socketEnabled === false) {
            console.log('[useSocket] Socket.IO disabled by feature flag')
            return false
        }

        // Require authentication token
        const token = authStore.token
        if (!token) {
            console.log('[useSocket] No auth token, skipping socket connection')
            return false
        }

        // Connect to socket server
        const socket = socketService.connect(token)

        // Update reactive state
        connected.value = socketService.isConnected()
        socketId.value = socketService.getSocketId()

        // Listen for connection state changes
        socketService.on('connect', () => {
            connected.value = true
            socketId.value = socketService.getSocketId()
            console.log('[useSocket] Connected:', socketId.value)
        })

        socketService.on('disconnect', () => {
            connected.value = false
            socketId.value = null
            console.log('[useSocket] Disconnected')
        })

        return true
    }

    /**
     * Disconnect socket
     */
    const disconnect = () => {
        socketService.disconnect()
        connected.value = false
        socketId.value = null
    }

    /**
     * Reconnect socket (if disconnected)
     */
    const reconnect = () => {
        if (!connected.value) {
            initSocket()
        }
    }

    // Computed properties
    const isConnected = computed(() => connected.value)
    const isAuthenticated = computed(() => authStore.isAuthenticated)

    // Auto-initialize on mount if user is authenticated
    onMounted(() => {
        if (isAuthenticated.value) {
            initSocket()
        }
    })

    // Auto-cleanup on unmount
    onUnmounted(() => {
        disconnect()
    })

    return {
        // Socket instance
        socket: socketService,

        // State
        connected: isConnected,
        socketId,
        isAuthenticated,

        // Methods
        initSocket,
        disconnect,
        reconnect,

        // Utility methods (proxied from service)
        on: socketService.on.bind(socketService),
        off: socketService.off.bind(socketService),
        emit: socketService.emit.bind(socketService),
        joinRoom: socketService.joinRoom.bind(socketService),
        leaveRoom: socketService.leaveRoom.bind(socketService),
    }
}
