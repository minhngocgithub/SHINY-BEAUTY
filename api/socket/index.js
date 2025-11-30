const { socketAuthMiddleware } = require("./middleware/socketAuth")
const { registerOrderHandlers } = require("./handlers/orderHandler")
const { registerFlashSaleHandlers } = require("./handlers/flashSaleHandler")
const { registerCartHandlers } = require("./handlers/cartHandler")
const { registerNotificationHandlers } = require("./handlers/notificationHandler")
const { registerFeaturedHandlers } = require("./handlers/featuredHandler")
const realtimeService = require("../services/realtime.service")

function initializeSocketHandlers(io) {
    // Initialize realtime service
    realtimeService.initialize(io)

    // Authentication middleware
    io.use(socketAuthMiddleware)

    io.on("connection", (socket) => {
        console.log(`✅ User connected: ${socket.userId} (${socket.id})`)
        socket.join(`user:${socket.userId}`)

        // Join admin room if admin
        if (socket.isAdmin) {
            socket.join("admin-room")
            console.log(`👑 Admin connected: ${socket.userId}`)
        }

        // Register all handlers
        registerOrderHandlers(io, socket)
        registerFlashSaleHandlers(io, socket)
        registerCartHandlers(io, socket)
        registerNotificationHandlers(io, socket)
        registerFeaturedHandlers(io, socket)

        socket.on("disconnect", (reason) => {
            console.log(`❌ User disconnected: ${socket.userId} - Reason: ${reason}`)
        })

        socket.on("error", (error) => {
            console.error(`Socket error for user ${socket.userId}:`, error)
        })

        // Ping/Pong for connection health
        socket.on("ping", () => {
            socket.emit("pong", { timestamp: Date.now() })
        })
    })

    // Broadcast active users count every 30 seconds
    setInterval(() => {
        const userCount = io.sockets.sockets.size
        realtimeService.broadcastUserCount(userCount)
    }, 30000)

    console.log("✅ Socket handlers initialized")
}

module.exports = { initializeSocketHandlers }
