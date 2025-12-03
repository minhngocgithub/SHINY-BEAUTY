import { io } from 'socket.io-client'
class SocketService {
    constructor() {
        this.socket = null
        this.adminSocket = null
        this.connected = false
        this.adminConnected = false
        this.listeners = new Map()
        this.adminListeners = new Map()
        this.reconnectAttempts = 0
        this.adminReconnectAttempts = 0
        this.maxReconnectAttempts = 5
    }

    /**
     * Connect to user namespace (default '/')
     */
    connect(token) {
        if (this.socket?.connected) {
            console.log('[Socket] Already connected:', this.socket.id)
            return this.socket
        }

        const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000'
        const path = import.meta.env.VITE_SOCKET_PATH || '/socket.io'

        console.log('[Socket] Connecting to user namespace:', socketUrl)

        this.socket = io(socketUrl, {
            path,
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: this.maxReconnectAttempts,
            autoConnect: true,
            withCredentials: true,
        })

        this.setupDefaultListeners(this.socket, 'User', (connected) => {
            this.connected = connected
        })
        return this.socket
    }

    /**
     * Connect to admin namespace ('/admin')
     */
    connectAdmin(token) {
        if (this.adminSocket?.connected) {
            console.log('[Admin Socket] Already connected:', this.adminSocket.id)
            return this.adminSocket
        }

        const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000'
        const path = import.meta.env.VITE_SOCKET_PATH || '/socket.io'

        console.log('[Admin Socket] Connecting to admin namespace:', socketUrl + '/admin')

        this.adminSocket = io(socketUrl + '/admin', {
            path,
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: this.maxReconnectAttempts,
            autoConnect: true,
            withCredentials: true,
        })

        this.setupDefaultListeners(this.adminSocket, 'Admin', (connected) => {
            this.adminConnected = connected
        }, true)
        return this.adminSocket
    }
    /**
     * Setup default event listeners for socket
     */
    setupDefaultListeners(socket, context = 'User', onConnectionChange, isAdmin = false) {
        if (!socket) return

        const reconnectAttemptsKey = isAdmin ? 'adminReconnectAttempts' : 'reconnectAttempts'

        socket.on('connect', () => {
            console.log(`✅ [${context} Socket] Connected:`, socket.id)
            onConnectionChange(true)
            this[reconnectAttemptsKey] = 0
        })

        socket.on('disconnect', (reason) => {
            console.log(`❌ [${context} Socket] Disconnected:`, reason)
            onConnectionChange(false)

            if (reason === 'io server disconnect') {
                // Server disconnected, need manual reconnect
                console.log(`[${context} Socket] Server disconnected, attempting manual reconnect...`)
                setTimeout(() => socket?.connect(), 1000)
            }
        })

        socket.on('connect_error', (error) => {
            console.error(`[${context} Socket] Connection error:`, error.message)
            this[reconnectAttemptsKey]++

            if (this[reconnectAttemptsKey] >= this.maxReconnectAttempts) {
                console.error(`[${context} Socket] Max reconnection attempts reached`)
            }
        })

        socket.on('error', (error) => {
            console.error(`[${context} Socket] Error:`, error)
        })

        socket.on('reconnect', (attemptNumber) => {
            console.log(`🔄 [${context} Socket] Reconnected after ${attemptNumber} attempts`)
            this[reconnectAttemptsKey] = 0
        })

        socket.on('reconnect_attempt', (attemptNumber) => {
            console.log(`🔄 [${context} Socket] Reconnection attempt ${attemptNumber}/${this.maxReconnectAttempts}`)
        })

        socket.on('reconnect_failed', () => {
            console.error(`[${context} Socket] Reconnection failed`)
        })
    }

    /**
     * Register event listener for user socket
     */
    on(event, callback) {
        if (!this.socket) {
            console.warn('[Socket] Socket not initialized, cannot listen to:', event)
            return
        }

        this.socket.on(event, callback)
        this.listeners.set(event, callback)
        console.log(`[Socket] Listening to: ${event}`)
    }

    /**
     * Register event listener for admin socket
     */
    onAdmin(event, callback) {
        if (!this.adminSocket) {
            console.warn('[Admin Socket] Socket not initialized, cannot listen to:', event)
            return
        }

        this.adminSocket.on(event, callback)
        this.adminListeners.set(event, callback)
        console.log(`[Admin Socket] Listening to: ${event}`)
    }

    /**
     * Remove event listener from user socket
     */
    off(event) {
        if (!this.socket) return

        const callback = this.listeners.get(event)
        if (callback) {
            this.socket.off(event, callback)
            this.listeners.delete(event)
            console.log(`[Socket] Stopped listening to: ${event}`)
        }
    }

    /**
     * Remove event listener from admin socket
     */
    offAdmin(event) {
        if (!this.adminSocket) return

        const callback = this.adminListeners.get(event)
        if (callback) {
            this.adminSocket.off(event, callback)
            this.adminListeners.delete(event)
            console.log(`[Admin Socket] Stopped listening to: ${event}`)
        }
    }

    /**
     * Emit event to user socket
     */
    emit(event, data) {
        if (!this.socket?.connected) {
            console.warn('[Socket] Not connected, cannot emit:', event)
            return false
        }

        this.socket.emit(event, data)
        console.log(`[Socket] Emitted: ${event}`, data)
        return true
    }

    /**
     * Emit event to admin socket
     */
    emitAdmin(event, data) {
        if (!this.adminSocket?.connected) {
            console.warn('[Admin Socket] Not connected, cannot emit:', event)
            return false
        }

        this.adminSocket.emit(event, data)
        console.log(`[Admin Socket] Emitted: ${event}`, data)
        return true
    }

    /**
     * Join room (user socket)
     */
    joinRoom(roomId) {
        return this.emit('join', { room: roomId })
    }

    /**
     * Leave room (user socket)
     */
    leaveRoom(roomId) {
        return this.emit('leave', { room: roomId })
    }

    /**
     * Join admin room
     */
    joinAdminRoom(roomId) {
        return this.emitAdmin('join', { room: roomId })
    }

    /**
     * Leave admin room
     */
    leaveAdminRoom(roomId) {
        return this.emitAdmin('leave', { room: roomId })
    }

    /**
     * Check if user socket is connected
     */
    isConnected() {
        return this.socket?.connected || false
    }

    /**
     * Check if admin socket is connected
     */
    isAdminConnected() {
        return this.adminSocket?.connected || false
    }

    /**
     * Get user socket ID
     */
    getSocketId() {
        return this.socket?.id || null
    }

    /**
     * Get admin socket ID
     */
    getAdminSocketId() {
        return this.adminSocket?.id || null
    }

    /**
     * Get socket instance (user)
     */
    getSocket() {
        return this.socket
    }

    /**
     * Get admin socket instance
     */
    getAdminSocket() {
        return this.adminSocket
    }

    /**
     * Disconnect user socket
     */
    disconnect() {
        if (this.socket) {
            console.log('[Socket] Disconnecting user socket...')

            // Clear all listeners
            this.listeners.forEach((callback, event) => {
                this.socket.off(event, callback)
            })
            this.listeners.clear()

            // Disconnect socket
            this.socket.disconnect()
            this.socket = null
            this.connected = false
            this.reconnectAttempts = 0

            console.log('[Socket] User socket disconnected and cleaned up')
        }
    }

    /**
     * Disconnect admin socket
     */
    disconnectAdmin() {
        if (this.adminSocket) {
            console.log('[Admin Socket] Disconnecting admin socket...')

            // Clear all listeners
            this.adminListeners.forEach((callback, event) => {
                this.adminSocket.off(event, callback)
            })
            this.adminListeners.clear()

            // Disconnect socket
            this.adminSocket.disconnect()
            this.adminSocket = null
            this.adminConnected = false
            this.adminReconnectAttempts = 0

            console.log('[Admin Socket] Admin socket disconnected and cleaned up')
        }
    }

    /**
     * Disconnect all sockets
     */
    disconnectAll() {
        this.disconnect()
        this.disconnectAdmin()
        console.log('[Socket] All sockets disconnected')
    }
}

// Export singleton instance
export default new SocketService()
