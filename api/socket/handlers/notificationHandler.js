function registerNotificationHandlers(io, socket) {
    // Subscribe to notifications
    socket.on("notifications:subscribe", () => {
        socket.join(`user:${socket.userId}`)
        socket.emit("notifications:subscribed", {
            userId: socket.userId,
            timestamp: new Date(),
        })
    })

    // Mark notification as read
    socket.on("notification:read", async (notificationId) => {
        try {
            socket.emit("notification:marked-read", { notificationId })
        } catch (error) {
            socket.emit("error", { message: "Failed to mark notification" })
        }
    })

    // Unsubscribe
    socket.on("notifications:unsubscribe", () => {
        socket.leave(`user:${socket.userId}`)
    })
}

module.exports = { registerNotificationHandlers }
