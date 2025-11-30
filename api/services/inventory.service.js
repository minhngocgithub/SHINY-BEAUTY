const mongoose = require("mongoose")
const { redisClient } = require("../config/redis")
const logger = require("../config/logger")

class InventoryService {
    /**
     * Lua script for atomic stock reservation
     * Prevents race conditions and overselling
     */
    static RESERVE_STOCK_SCRIPT = `
    local stockKey = KEYS[1]
    local reservationKey = KEYS[2]
    local productId = ARGV[1]
    local quantity = tonumber(ARGV[2])
    local ttl = tonumber(ARGV[3])
    
    local available = tonumber(redis.call('GET', stockKey) or 0)
    
    if available < quantity then
      return {-1, available}
    end
    
    redis.call('DECRBY', stockKey, quantity)
    redis.call('HSET', reservationKey, productId, quantity)
    redis.call('EXPIRE', reservationKey, ttl)
    
    return {1, available - quantity}
  `

    /**
     * Reserve stock for an order (Atomic with Lua)
     * Prevents overselling in high-concurrency scenarios
     */
    static async reserveStock(userId, items) {
        const reservationId = `inv:reserve:${userId}:${Date.now()}`
        const ttl = 10 * 60 // 10 minutes reservation TTL
        const reservedItems = []

        try {
            for (const item of items) {
                const productId = item.product || item.bundle
                const stockKey = `inv:stock:${productId}`

                // Execute atomic reservation using Lua script
                const result = await redisClient.eval(
                    this.RESERVE_STOCK_SCRIPT,
                    2,
                    stockKey,
                    reservationId,
                    productId,
                    item.quantity,
                    ttl
                )

                const [status, remaining] = result

                if (status === -1) {
                    // Insufficient stock - rollback all previous reservations
                    await this.cancelReservation(reservationId)

                    throw new Error(
                        `Insufficient stock for product ${productId}. ` +
                        `Requested: ${item.quantity}, Available: ${remaining}`
                    )
                }

                reservedItems.push({
                    productId,
                    quantity: item.quantity,
                    remainingStock: remaining
                })

                logger.debug("Stock reserved", {
                    productId,
                    quantity: item.quantity,
                    remaining
                })
            }

            // Store metadata
            await redisClient.hset(
                `${reservationId}:meta`,
                'userId', userId,
                'createdAt', Date.now(),
                'itemCount', items.length
            )
            await redisClient.expire(`${reservationId}:meta`, ttl)

            logger.info("Stock reservation successful", {
                reservationId,
                userId,
                itemsCount: items.length
            })

            return {
                reservationId,
                reservedItems,
                expiresAt: Date.now() + (ttl * 1000)
            }

        } catch (error) {
            logger.error("Stock reservation failed", {
                error: error.message,
                userId,
                items,
                reservedItems
            })
            throw error
        }
    }

    /**
     * Confirm reservation and deduct from database
     */
    static async confirmReservation(reservationId, orderId) {
        try {
            const reservation = await redisClient.hgetall(reservationId)

            if (!reservation || Object.keys(reservation).length === 0) {
                throw new Error("Reservation not found or expired")
            }

            const Product = mongoose.model("Product")
            const ProductBundle = mongoose.model("ProductBundle")
            const updates = []

            // Update database in parallel
            for (const [productId, quantity] of Object.entries(reservation)) {
                updates.push(
                    this._updateProductStock(Product, ProductBundle, productId, Number(quantity))
                )
            }

            await Promise.all(updates)

            // Link reservation to order for audit trail
            await redisClient.setex(
                `inv:order:${orderId}`,
                24 * 60 * 60,
                JSON.stringify({
                    reservationId,
                    confirmedAt: Date.now(),
                    items: reservation
                })
            )

            // Clean up reservation
            await redisClient.del(reservationId, `${reservationId}:meta`)

            logger.info("Stock reservation confirmed", { orderId, reservationId })

            return {
                success: true,
                orderId,
                confirmedItems: Object.keys(reservation).length
            }

        } catch (error) {
            logger.error("Failed to confirm reservation", {
                error: error.message,
                reservationId,
                orderId
            })
            throw error
        }
    }

    /**
     * Helper: Update product stock in database
     */
    static async _updateProductStock(Product, ProductBundle, productId, quantity) {
        try {
            // Try as regular product first
            const product = await Product.findByIdAndUpdate(
                productId,
                {
                    $inc: {
                        countInStock: -quantity,
                        sold: quantity
                    }
                },
                { new: true }
            )

            if (product) {
                logger.debug("Product stock updated", {
                    productId,
                    newStock: product.countInStock,
                    sold: product.sold
                })
                return product
            }

            // Try as bundle
            const bundle = await ProductBundle.findByIdAndUpdate(
                productId,
                {
                    $inc: {
                        countInStock: -quantity,
                        sold: quantity
                    }
                },
                { new: true }
            )

            if (bundle) {
                logger.debug("Bundle stock updated", {
                    bundleId: productId,
                    newStock: bundle.countInStock
                })
                return bundle
            }

            throw new Error(`Product/Bundle not found: ${productId}`)

        } catch (error) {
            logger.error("Database stock update failed", {
                error: error.message,
                productId,
                quantity
            })
            throw error
        }
    }

    /**
     * Cancel reservation and release reserved stock
     */
    static async cancelReservation(reservationId) {
        try {
            const reservation = await redisClient.hgetall(reservationId)

            if (!reservation || Object.keys(reservation).length === 0) {
                logger.warn("Reservation already cancelled or expired", { reservationId })
                return
            }

            // Release stock back to Redis cache
            const pipeline = redisClient.pipeline()

            for (const [productId, quantity] of Object.entries(reservation)) {
                const stockKey = `inv:stock:${productId}`
                pipeline.incrby(stockKey, Number(quantity))
            }

            await pipeline.exec()

            // Clean up
            await redisClient.del(reservationId, `${reservationId}:meta`)

            logger.info("Stock reservation cancelled", {
                reservationId,
                releasedItems: Object.keys(reservation).length
            })

            return {
                success: true,
                releasedItems: Object.keys(reservation).length
            }

        } catch (error) {
            logger.error("Failed to cancel reservation", {
                error: error.message,
                reservationId
            })
            throw error
        }
    }

    /**
     * Get current stock level (Redis cache + DB fallback)
     */
    static async getStockLevel(productId, options = {}) {
        const { forceDB = false } = options

        try {
            const stockKey = `inv:stock:${productId}`

            // Force database query if requested
            if (!forceDB) {
                const cachedStock = await redisClient.get(stockKey)
                if (cachedStock !== null) {
                    return Number(cachedStock)
                }
            }

            // Fetch from database
            const Product = mongoose.model("Product")
            const ProductBundle = mongoose.model("ProductBundle")

            let stock = 0
            let product = await Product.findById(productId).select("countInStock")

            if (!product) {
                product = await ProductBundle.findById(productId).select("countInStock")
            }

            if (product) {
                stock = product.countInStock || 0
                // Update cache
                await redisClient.setex(stockKey, 3600, stock)
            }

            return stock

        } catch (error) {
            logger.error("Failed to get stock level", {
                error: error.message,
                productId
            })
            return 0
        }
    }

    /**
     * Sync Redis cache with database (periodic reconciliation)
     * Should be run via cron job every 1-5 minutes
     */
    static async syncStockCache() {
        const startTime = Date.now()

        try {
            const Product = mongoose.model("Product")
            const ProductBundle = mongoose.model("ProductBundle")

            // Fetch all products and bundles
            const [products, bundles] = await Promise.all([
                Product.find().select("_id countInStock").lean(),
                ProductBundle.find().select("_id countInStock").lean()
            ])

            const allItems = [...products, ...bundles]
            const pipeline = redisClient.pipeline()

            // Batch update Redis
            for (const item of allItems) {
                const stockKey = `inv:stock:${item._id}`
                pipeline.setex(stockKey, 3600, item.countInStock || 0)
            }

            await pipeline.exec()

            const duration = Date.now() - startTime

            logger.info("Stock cache synced successfully", {
                productsCount: products.length,
                bundlesCount: bundles.length,
                totalItems: allItems.length,
                durationMs: duration
            })

            return {
                success: true,
                synced: allItems.length,
                duration
            }

        } catch (error) {
            logger.error("Failed to sync stock cache", {
                error: error.message,
                stack: error.stack
            })
            throw error
        }
    }

    /**
     * Get inventory analytics with low stock alerts
     */
    static async getInventoryAnalytics(options = {}) {
        const { lowStockThreshold = 10 } = options

        try {
            const Product = mongoose.model("Product")
            const ProductBundle = mongoose.model("ProductBundle")

            const [productAnalytics, bundleAnalytics] = await Promise.all([
                Product.aggregate([
                    {
                        $group: {
                            _id: null,
                            totalStock: { $sum: "$countInStock" },
                            totalSold: { $sum: "$sold" },
                            lowStockCount: {
                                $sum: {
                                    $cond: [
                                        {
                                            $and: [
                                                { $lt: ["$countInStock", lowStockThreshold] },
                                                { $gt: ["$countInStock", 0] }
                                            ]
                                        },
                                        1,
                                        0
                                    ]
                                }
                            },
                            outOfStockCount: {
                                $sum: { $cond: [{ $eq: ["$countInStock", 0] }, 1, 0] }
                            }
                        }
                    }
                ]),
                ProductBundle.aggregate([
                    {
                        $group: {
                            _id: null,
                            totalStock: { $sum: "$countInStock" },
                            totalSold: { $sum: "$sold" },
                            lowStockCount: {
                                $sum: {
                                    $cond: [
                                        {
                                            $and: [
                                                { $lt: ["$countInStock", lowStockThreshold] },
                                                { $gt: ["$countInStock", 0] }
                                            ]
                                        },
                                        1,
                                        0
                                    ]
                                }
                            },
                            outOfStockCount: {
                                $sum: { $cond: [{ $eq: ["$countInStock", 0] }, 1, 0] }
                            }
                        }
                    }
                ])
            ])

            const products = productAnalytics[0] || {
                totalStock: 0,
                totalSold: 0,
                lowStockCount: 0,
                outOfStockCount: 0
            }

            const bundles = bundleAnalytics[0] || {
                totalStock: 0,
                totalSold: 0,
                lowStockCount: 0,
                outOfStockCount: 0
            }

            return {
                products,
                bundles,
                combined: {
                    totalStock: products.totalStock + bundles.totalStock,
                    totalSold: products.totalSold + bundles.totalSold,
                    lowStockCount: products.lowStockCount + bundles.lowStockCount,
                    outOfStockCount: products.outOfStockCount + bundles.outOfStockCount,
                    stockHealthScore: this._calculateHealthScore(products, bundles)
                }
            }

        } catch (error) {
            logger.error("Failed to get inventory analytics", {
                error: error.message
            })
            return null
        }
    }

    /**
     * Calculate inventory health score (0-100)
     */
    static _calculateHealthScore(products, bundles) {
        const totalItems = (products.totalStock + bundles.totalStock) || 1
        const totalProblems =
            (products.lowStockCount + bundles.lowStockCount) * 0.5 +
            (products.outOfStockCount + bundles.outOfStockCount)

        const score = Math.max(0, 100 - (totalProblems / totalItems) * 100)
        return Math.round(score * 10) / 10
    }

    /**
     * Get low stock products for restocking alerts
     */
    static async getLowStockProducts(threshold = 10, limit = 50) {
        try {
            const Product = mongoose.model("Product")
            const ProductBundle = mongoose.model("ProductBundle")

            const [products, bundles] = await Promise.all([
                Product.find({
                    countInStock: { $gt: 0, $lt: threshold }
                })
                    .select("name countInStock sold category")
                    .sort("countInStock")
                    .limit(limit)
                    .lean(),

                ProductBundle.find({
                    countInStock: { $gt: 0, $lt: threshold }
                })
                    .select("name countInStock sold")
                    .sort("countInStock")
                    .limit(limit)
                    .lean()
            ])

            return {
                products,
                bundles,
                total: products.length + bundles.length
            }

        } catch (error) {
            logger.error("Failed to get low stock products", {
                error: error.message
            })
            return { products: [], bundles: [], total: 0 }
        }
    }

    /**
     * Validate stock availability for multiple products
     */
    static async validateStockAvailability(items) {
        try {
            const results = await Promise.all(
                items.map(async (item) => {
                    const stock = await this.getStockLevel(item.product || item.bundle)
                    return {
                        productId: item.product || item.bundle,
                        requested: item.quantity,
                        available: stock,
                        sufficient: stock >= item.quantity
                    }
                })
            )

            const allAvailable = results.every(r => r.sufficient)

            return {
                valid: allAvailable,
                results,
                insufficientItems: results.filter(r => !r.sufficient)
            }

        } catch (error) {
            logger.error("Stock validation failed", {
                error: error.message
            })
            throw error
        }
    }
}

module.exports = InventoryService