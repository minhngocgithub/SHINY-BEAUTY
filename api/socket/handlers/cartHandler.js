const cacheService = require("../../services/caches.service")

function registerCartHandlers(io, socket) {
  // Sync cart from device
  socket.on("cart:sync", async (cart) => {
    try {
      // Save to Redis
      await cacheService.setUserCart(socket.userId, cart)

      // Join user's room for cross-device sync
      socket.join(`user:${socket.userId}`)

      // Broadcast to other devices
      socket.to(`user:${socket.userId}`).emit("cart:updated", {
        cart,
        deviceId: socket.id,
        timestamp: new Date(),
      })

      socket.emit("cart:synced", { success: true })
    } catch (error) {
      socket.emit("error", { message: "Cart sync failed" })
    }
  })

  // Get cached cart
  socket.on("cart:get", async () => {
    try {
      const cart = await cacheService.getUserCart(socket.userId)
      socket.emit("cart:data", cart || [])
    } catch (error) {
      socket.emit("error", { message: "Failed to get cart" })
    }
  })

  // Clear cart
  socket.on("cart:clear", async () => {
    try {
      await cacheService.deleteUserCart(socket.userId)

      io.to(`user:${socket.userId}`).emit("cart:cleared", {
        timestamp: new Date(),
      })
    } catch (error) {
      socket.emit("error", { message: "Failed to clear cart" })
    }
  })
}

module.exports = { registerCartHandlers }
