const Product = require("../../models/product.models")
const cacheService = require("../../services/caches.service")
const realtimeService = require("../../services/realtime.service")

function registerFlashSaleHandlers(io, socket) {
    // Join flash sale room
    socket.on("flashsale:join", async (productId) => {
        try {
            const product = await Product.findById(productId)

            if (!product || !product.flashSale?.isActive) {
                return socket.emit("error", { message: "Flash sale not found" })
            }

            socket.join(`flashsale:${productId}`)

            // Get current stock from Redis
            let stock = await cacheService.getFlashSaleStock(productId)

            if (stock === null) {
                stock = product.flashSale.stock
                await cacheService.setFlashSaleStock(productId, stock)
            }

            socket.emit("flashsale:joined", {
                productId,
                product: {
                    name: product.productName,
                    originalPrice: product.originalPrice,
                    flashPrice: product.flashSale.price,
                    discount: product.flashSale.discountPercent,
                },
                stock,
                maxPerUser: product.flashSale.maxQuantityPerUser,
                endsAt: product.flashSale.endTime,
            })
        } catch (error) {
            socket.emit("error", { message: "Failed to join flash sale" })
        }
    })

    // Reserve flash sale item
    socket.on("flashsale:reserve", async (data) => {
        try {
            const { productId, quantity } = data

            const product = await Product.findById(productId)

            if (!product?.flashSale?.isActive) {
                return socket.emit("flashsale:reserve-failed", {
                    reason: "not_available",
                    message: "Flash sale is not active",
                })
            }

            // Check user's purchase count
            const userCount = await cacheService.getUserPurchaseCount(socket.userId, productId)

            const maxPerUser = product.flashSale?.maxQuantityPerUser || 1

            if (userCount + quantity > maxPerUser) {
                return socket.emit("flashsale:reserve-failed", {
                    reason: "limit_exceeded",
                    message: `Maximum ${maxPerUser} items per customer`,
                })
            }

            // Try to decrement stock
            const success = await cacheService.decrementFlashSaleStock(productId, quantity)

            if (!success) {
                return socket.emit("flashsale:reserve-failed", {
                    reason: "out_of_stock",
                    message: "Product is out of stock",
                })
            }

            // Increment user purchase count
            await cacheService.incrementUserPurchaseCount(socket.userId, productId, quantity)

            socket.emit("flashsale:reserved", {
                productId,
                quantity,
                success: true,
            })

            // Broadcast new stock to all users viewing this flash sale
            const newStock = await cacheService.getFlashSaleStock(productId)
            realtimeService.emitFlashSaleStockUpdate(productId, newStock)
        } catch (error) {
            socket.emit("error", { message: "Reservation failed" })
        }
    })

    // Leave flash sale room
    socket.on("flashsale:leave", (productId) => {
        socket.leave(`flashsale:${productId}`)
    })
}

module.exports = { registerFlashSaleHandlers }
