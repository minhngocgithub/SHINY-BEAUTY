const mongoose = require("mongoose")
const logger = require("../config/logger")

class TransactionService {
    /**
     * Execute order creation with ACID transaction
     * Prevents race conditions and ensures data consistency
     */
    static async executeOrderTransaction(orderData, session) {
        try {
            const Order = mongoose.model("Order")
            const Product = mongoose.model("Product")
            const ProductBundle = mongoose.model("ProductBundle")
            const User = mongoose.model("User")

            // Step 1: Validate stock availability within transaction
            for (const item of orderData.orderItems) {
                let product
                if (item.bundle) {
                    product = await ProductBundle.findById(item.bundle).session(session)
                } else {
                    product = await Product.findById(item.product).session(session)
                }

                if (!product) {
                    throw new Error(`Product ${item.product || item.bundle} not found`)
                }

                if (product.countInStock < item.quantity) {
                    throw new Error(
                        `Insufficient stock for ${product.name}. Available: ${product.countInStock}, Requested: ${item.quantity}`,
                    )
                }

                // Check flash sale limits if applicable
                if (product.flashSale?.isFlashSale) {
                    if (product.flashSale?.maxQuantityPerUser) {
                        const userOrderCount = await Order.countDocuments(
                            {
                                user: orderData.user,
                                "orderItems.product": item.product,
                            },
                            { session },
                        )
                        if (userOrderCount >= product.flashSale.maxQuantityPerUser) {
                            throw new Error(
                                `Flash sale limit (${product.flashSale.maxQuantityPerUser} per user) exceeded for ${product.name}`,
                            )
                        }
                    }
                }
            }

            // Step 2: Update product stock
            for (const item of orderData.orderItems) {
                if (item.bundle) {
                    await ProductBundle.findByIdAndUpdate(
                        item.bundle,
                        { $inc: { countInStock: -item.quantity } },
                        { session, new: true },
                    )
                } else {
                    await Product.findByIdAndUpdate(
                        item.product,
                        {
                            $inc: {
                                countInStock: -item.quantity,
                                sold: item.quantity,
                            },
                        },
                        { session, new: true },
                    )
                }
            }

            // Step 3: Create order
            const order = new Order(orderData)
            await order.save({ session })

            // Step 4: Update user order history
            await User.findByIdAndUpdate(
                orderData.user,
                {
                    $inc: { totalOrders: 1 },
                    $push: { orders: order._id },
                },
                { session, new: true },
            )

            logger.info("Order created successfully within transaction", {
                orderId: order._id,
                userId: orderData.user,
            })

            return order
        } catch (error) {
            logger.error("Transaction error during order creation", {
                error: error.message,
                orderData: orderData.user,
            })
            throw error
        }
    }

    /**
     * Execute order cancellation with stock rollback
     */
    static async executeCancelTransaction(orderId, session) {
        try {
            const Order = mongoose.model("Order")
            const Product = mongoose.model("Product")
            const ProductBundle = mongoose.model("ProductBundle")

            const order = await Order.findById(orderId).session(session)

            if (!order) {
                throw new Error("Order not found")
            }

            if (order.status === "CANCELLED") {
                throw new Error("Order already cancelled")
            }

            if (order.status === "DELIVERED") {
                throw new Error("Cannot cancel delivered order")
            }

            // Rollback stock for each item
            for (const item of order.orderItems) {
                if (item.bundle) {
                    await ProductBundle.findByIdAndUpdate(
                        item.bundle,
                        { $inc: { countInStock: item.quantity } },
                        { session, new: true },
                    )
                } else {
                    await Product.findByIdAndUpdate(
                        item.product,
                        {
                            $inc: {
                                countInStock: item.quantity,
                                sold: -item.quantity,
                            },
                        },
                        { session, new: true },
                    )
                }
            }

            // Update order status
            order.status = "CANCELLED"
            await order.save({ session })

            logger.info("Order cancelled successfully within transaction", {
                orderId: order._id,
            })

            return order
        } catch (error) {
            logger.error("Transaction error during order cancellation", {
                error: error.message,
                orderId: orderId,
            })
            throw error
        }
    }

    /**
     * Create session for transaction
     */
    static async startSession() {
        return await mongoose.startSession()
    }

    /**
     * Commit transaction
     */
    static async commitTransaction(session) {
        try {
            await session.commitTransaction()
            session.endSession()
        } catch (error) {
            logger.error("Failed to commit transaction", { error: error.message })
            throw error
        }
    }

    /**
     * Abort transaction and rollback
     */
    static async abortTransaction(session) {
        try {
            await session.abortTransaction()
            session.endSession()
        } catch (error) {
            logger.error("Failed to abort transaction", { error: error.message })
        }
    }
}

module.exports = TransactionService
