import { io } from 'socket.io-client'
class SocketService {
    constructor() {
        this.socket = null
        this.connected = false
        this.listeners = new Map()
        this.reconnectAttempts = 0
        this.maxReconnectAttempts = 5
    }

    connect(token) {
        if (this.socket?.connected) {
            console.log('[Socket] Already connected:', this.socket.id)
            return this.socket
        }

        const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000'
        const path = import.meta.env.VITE_SOCKET_PATH || '/socket.io'

        console.log('[Socket] Connecting to:', socketUrl)

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

        this.setupDefaultListeners()
        return this.socket
    }
    setupDefaultListeners() {
        if (!this.socket) return

        this.socket.on('connect', () => {
            console.log('✅ [Socket] Connected:', this.socket.id)
            this.connected = true
            this.reconnectAttempts = 0
        })

        this.socket.on('disconnect', (reason) => {
            console.log('❌ [Socket] Disconnected:', reason)
            this.connected = false

            if (reason === 'io server disconnect') {
                // Server disconnected, need manual reconnect
                console.log('[Socket] Server disconnected, attempting manual reconnect...')
                setTimeout(() => this.socket?.connect(), 1000)
            }
        })

        this.socket.on('connect_error', (error) => {
            console.error('[Socket] Connection error:', error.message)
            this.reconnectAttempts++

            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error('[Socket] Max reconnection attempts reached')
            }
        })

        this.socket.on('error', (error) => {
            console.error('[Socket] Error:', error)
        })

        this.socket.on('reconnect', (attemptNumber) => {
            console.log(`🔄 [Socket] Reconnected after ${attemptNumber} attempts`)
            this.reconnectAttempts = 0
        })

        this.socket.on('reconnect_attempt', (attemptNumber) => {
            console.log(`🔄 [Socket] Reconnection attempt ${attemptNumber}/${this.maxReconnectAttempts}`)
        })

        this.socket.on('reconnect_failed', () => {
            console.error('[Socket] Reconnection failed')
        })
    }
    on(event, callback) {
        if (!this.socket) {
            console.warn('[Socket] Socket not initialized, cannot listen to:', event)
            return
        }

        this.socket.on(event, callback)
        this.listeners.set(event, callback)
        console.log(`[Socket] Listening to: ${event}`)
    }

    off(event) {
        if (!this.socket) return

        const callback = this.listeners.get(event)
        if (callback) {
            this.socket.off(event, callback)
            this.listeners.delete(event)
            console.log(`[Socket] Stopped listening to: ${event}`)
        }
    }
    emit(event, data) {
        if (!this.socket?.connected) {
            console.warn('[Socket] Not connected, cannot emit:', event)
            return false
        }

        this.socket.emit(event, data)
        console.log(`[Socket] Emitted: ${event}`, data)
        return true
    }

    joinRoom(roomId) {
        return this.emit('join', { room: roomId })
    }

    leaveRoom(roomId) {
        return this.emit('leave', { room: roomId })
    }


    isConnected() {
        return this.socket?.connected || false
    }

    getSocketId() {
        return this.socket?.id || null
    }
    disconnect() {
        if (this.socket) {
            console.log('[Socket] Disconnecting...')

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

            console.log('[Socket] Disconnected and cleaned up')
        }
    }
}

// Export singleton instance
export default new SocketService()
