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

        // Require authentication token - check both authStore and localStorage
        const token = authStore.token || localStorage.getItem('accessToken')
        if (!token) {
            console.log('[useSocket] No auth token found in store or localStorage, skipping socket connection')
            console.log('[useSocket] authStore.isLoggedIn:', authStore.isLoggedIn)
            console.log('[useSocket] localStorage.accessToken:', !!localStorage.getItem('accessToken'))
            return false
        }

        console.log('[useSocket] Token found, connecting to socket...')

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
    const isAuthenticated = computed(() => {
        return authStore.isLoggedIn && !!localStorage.getItem('accessToken')
    })

    // Auto-initialize on mount if user is authenticated
    onMounted(() => {
        console.log('[useSocket] onMounted - isAuthenticated:', isAuthenticated.value)
        console.log('[useSocket] onMounted - authStore.isLoggedIn:', authStore.isLoggedIn)
        console.log('[useSocket] onMounted - has accessToken:', !!localStorage.getItem('accessToken'))

        if (isAuthenticated.value) {
            console.log('[useSocket] Auto-initializing socket...')
            initSocket()
        } else {
            console.log('[useSocket] User not authenticated, skipping auto-init')
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
