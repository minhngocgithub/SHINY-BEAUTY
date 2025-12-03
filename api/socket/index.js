const { socketAuthMiddleware } = require("./middleware/socketAuth")
const adminSocketAuth = require("./middleware/adminSocketAuth")
const { registerOrderHandlers } = require("./handlers/orderHandler")
const { registerFlashSaleHandlers } = require("./handlers/flashSaleHandler")
const { registerCartHandlers } = require("./handlers/cartHandler")
const { registerNotificationHandlers } = require("./handlers/notificationHandler")
const { registerFeaturedHandlers } = require("./handlers/featuredHandler")
const { setupAdminDashboard } = require("./handlers/adminDashboardHandler")
const realtimeService = require("../services/realtime.service")

function initializeSocketHandlers(io) {
    // Initialize realtime service
    realtimeService.initialize(io)

    // Create separate namespaces for admin and regular users
    const adminNamespace = io.of("/admin")
    const userNamespace = io.of("/")

    // ========== ADMIN NAMESPACE ==========
    adminNamespace.use(adminSocketAuth)

    adminNamespace.on("connection", (socket) => {
        console.log(`👑 Admin connected: ${socket.user.email} (${socket.id})`)

        // Register admin-specific handlers
        setupAdminDashboard(adminNamespace, socket)
        // TODO: Implement in Phase 2
        // setupAdminAnalytics(adminNamespace, socket)
        // setupAdminOrders(adminNamespace, socket)

        socket.on("disconnect", (reason) => {
            console.log(`❌ Admin disconnected: ${socket.user.email} - Reason: ${reason}`)
        })

        socket.on("error", (error) => {
            console.error(`Socket error for admin ${socket.user.email}:`, error)
        })
    })

    // ========== USER NAMESPACE (DEFAULT) ==========
    userNamespace.use(socketAuthMiddleware)

    userNamespace.on("connection", (socket) => {
        console.log(`✅ User connected: ${socket.userId} (${socket.id})`)
        socket.join(`user:${socket.userId}`)

        // Join admin room if admin (for backward compatibility)
        if (socket.isAdmin) {
            socket.join("admin-room")
            console.log(`👑 Admin in user namespace: ${socket.userId}`)
        }

        // Register all user handlers
        registerOrderHandlers(userNamespace, socket)
        registerFlashSaleHandlers(userNamespace, socket)
        registerCartHandlers(userNamespace, socket)
        registerNotificationHandlers(userNamespace, socket)
        registerFeaturedHandlers(userNamespace, socket)

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
        const userCount = userNamespace.sockets.size
        const adminCount = adminNamespace.sockets.size
        realtimeService.broadcastUserCount(userCount)

        // Broadcast to admin dashboard
        adminNamespace.to("admin:dashboard").emit("admin:users:count", {
            total: userCount,
            admins: adminCount,
            timestamp: Date.now()
        })
    }, 30000)

    console.log("✅ Socket handlers initialized (User + Admin namespaces)")
}

module.exports = { initializeSocketHandlers }
