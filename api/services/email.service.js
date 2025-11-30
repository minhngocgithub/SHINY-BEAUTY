const nodemailer = require("nodemailer")
const logger = require("../config/logger")
const { redisClient } = require("../config/redis")
const transporter = require("../config/nodemailer")

class EmailService {
    /**
     * Send email asynchronously via queue
     */
    static async queueEmail(emailData) {
        try {
            const queueKey = "email:queue"
            await redisClient.rpush(queueKey, JSON.stringify(emailData))
            await redisClient.expire(queueKey, 24 * 60 * 60) // 24 hour TTL

            logger.info("Email queued", {
                to: emailData.to,
                subject: emailData.subject,
            })
        } catch (error) {
            logger.error("Failed to queue email", {
                error: error.message,
                to: emailData.to,
            })
            throw error
        }
    }

    /**
     * Send email directly (use for critical emails)
     */
    static async sendEmail(to, subject, html, replyTo = null) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER || process.env.EMAIL_NAME,
                to,
                subject,
                html,
            }

            if (replyTo) {
                mailOptions.replyTo = replyTo
            }

            const result = await transporter.sendMail(mailOptions)

            logger.info("Email sent successfully", {
                to,
                subject,
                messageId: result.messageId,
            })

            return result
        } catch (error) {
            logger.error("Failed to send email", {
                error: error.message,
                to,
                subject,
            })
            throw error
        }
    }

    /**
     * Send order confirmation email
     */
    static async sendOrderConfirmation(order, userEmail) {
        const html = require("../templates/orderConfirmation")({ order })

        await this.queueEmail({
            to: userEmail,
            subject: `Order Confirmation - ${order._id}`,
            html,
            type: "ORDER_CONFIRMATION",
            orderId: order._id.toString(),
        })
    }

    /**
     * Send order shipped email
     */
    static async sendOrderShipped(order, userEmail, trackingNumber) {
        const html = require("../templates/orderShipped")({ order, trackingNumber })

        await this.queueEmail({
            to: userEmail,
            subject: `Your Order is Shipped - ${order._id}`,
            html,
            type: "ORDER_SHIPPED",
            orderId: order._id.toString(),
            trackingNumber,
        })
    }

    /**
     * Send order delivered email
     */
    static async sendOrderDelivered(order, userEmail) {
        const html = require("../templates/orderDelivered")({ order })

        await this.queueEmail({
            to: userEmail,
            subject: `Order Delivered - ${order._id}`,
            html,
            type: "ORDER_DELIVERED",
            orderId: order._id.toString(),
        })
    }

    /**
     * Send order cancelled email
     */
    static async sendOrderCancelled(order, userEmail, reason = "") {
        const html = require("../templates/orderCancelled.js")({ order, reason })

        await this.queueEmail({
            to: userEmail,
            subject: `Order Cancelled - ${order._id}`,
            html,
            type: "ORDER_CANCELLED",
            orderId: order._id.toString(),
        })
    }

    /**
     * Send price drop alert
     */
    static async sendPriceDropAlert(product, userEmail, oldPrice, newPrice) {
        const html = require("../templates/priceDropAlert")({
            product,
            oldPrice,
            newPrice,
        })

        await this.queueEmail({
            to: userEmail,
            subject: `Price Drop Alert - ${product.name}`,
            html,
            type: "PRICE_DROP_ALERT",
            productId: product._id.toString(),
        })
    }

    /**
     * Send flash sale notification
     */
    static async sendFlashSaleAlert(product, userEmail, discount, endTime) {
        const html = require("../templates/flashSaleAlert")({
            product,
            discount,
            endTime,
        })

        await this.queueEmail({
            to: userEmail,
            subject: `Flash Sale - ${product.name}`,
            html,
            type: "FLASH_SALE_ALERT",
            productId: product._id.toString(),
        })
    }

    /**
     * Send welcome email
     */
    static async sendWelcomeEmail(user) {
        const html = require("../templates/welcome")({ user })

        await this.queueEmail({
            to: user.email,
            subject: "Welcome to Our Store!",
            html,
            type: "WELCOME",
            userId: user._id.toString(),
        })
    }
}

module.exports = EmailService
