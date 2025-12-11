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

    /**
     * Send feedback reply notification email
     */
    static async sendFeedbackReply(recipientEmail, recipientName, feedbackId, replyMessage, adminName) {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px 20px; border-radius: 0 0 8px 8px; }
        .reply-box { background: white; padding: 20px; border-left: 4px solid #667eea; border-radius: 4px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💬 New Reply to Your Support Request</h1>
        </div>
        <div class="content">
            <p>Hi <strong>${recipientName}</strong>,</p>
            <p>Our support team has responded to your feedback:</p>
            
            <div class="reply-box">
                <p><strong>${adminName}</strong> replied:</p>
                <p>${replyMessage}</p>
            </div>

            <p>If you have any additional questions, feel free to contact us again.</p>
            
            <div style="text-align: center;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/support/feedback/${feedbackId}" class="button">
                    View Full Conversation
                </a>
            </div>
        </div>
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} Shiny Beauty. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        `.trim()

        await this.queueEmail({
            to: recipientEmail,
            subject: `Support Team Reply - Your Feedback`,
            html,
            type: "FEEDBACK_REPLY",
            feedbackId: feedbackId.toString(),
        })

        logger.info("Feedback reply email queued", {
            to: recipientEmail,
            feedbackId,
            adminName
        })
    }
}

module.exports = EmailService
