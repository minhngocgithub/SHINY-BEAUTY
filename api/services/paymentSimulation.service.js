const crypto = require("crypto");
const logger = require("../config/logger");

/**
 * Payment Simulation Service
 * Simulates VNPAY, MOMO, and BANK_TRANSFER payment gateways for development/demo
 * In production, replace with real payment gateway integration
 */
class PaymentSimulationService {
    // Simulation configuration
    static CONFIG = {
        VNPAY: {
            baseUrl: process.env.VNPAY_SIMULATION_URL || "http://localhost:4000/api/v1/payment/vnpay/callback",
            redirectDelay: parseInt(process.env.VNPAY_REDIRECT_DELAY) || 3000, // 3 seconds
            expirationMinutes: 15,
        },
        MOMO: {
            baseUrl: process.env.MOMO_SIMULATION_URL || "http://localhost:4000/api/v1/payment/momo/callback",
            redirectDelay: parseInt(process.env.MOMO_REDIRECT_DELAY) || 3000,
            expirationMinutes: 15,
        },
        BANK_TRANSFER: {
            bankName: "Ngân hàng TMCP Ngoại Thương Việt Nam (Vietcombank)",
            accountNumber: "1234567890",
            accountName: "CONG TY TNHH SHINY BEAUTY",
            expirationHours: 24,
        },
    };

    /**
     * Generate transaction ID
     * @param {String} prefix - Prefix (VNP, MOMO, BANK)
     * @returns {String} Transaction ID
     */
    static generateTransactionId(prefix) {
        const timestamp = Date.now();
        const random = crypto.randomBytes(4).toString("hex").toUpperCase();
        return `${prefix}_${timestamp}_${random}`;
    }

    /**
     * Create VNPAY payment simulation
     * @param {Object} orderData - Order information
     * @returns {Object} Payment data with gateway URL
     */
    static async createVNPayPayment(orderData) {
        try {
            const transactionId = this.generateTransactionId("VNP");
            const expiresAt = new Date(Date.now() + this.CONFIG.VNPAY.expirationMinutes * 60 * 1000);

            // Simulate VNPAY payment URL
            const paymentUrl = `${this.CONFIG.VNPAY.baseUrl}?` +
                `orderId=${orderData.orderId}` +
                `&amount=${Math.round(orderData.amount * 100)}` + // Amount in cents
                `&transactionId=${transactionId}` +
                `&bankCode=NCB` +
                `&locale=vn`;

            const paymentData = {
                method: "VNPAY",
                transactionId,
                gatewayUrl: paymentUrl,
                qrCode: null,
                accountInfo: null,
                expiresAt,
                simulationDelay: this.CONFIG.VNPAY.redirectDelay,
                instructions: [
                    "Click the button to proceed to VNPAY payment gateway",
                    "The payment will be automatically confirmed after a few seconds",
                    "This is a simulation for development/demo purposes"
                ],
            };

            logger.info("VNPAY payment simulation created", {
                orderId: orderData.orderId,
                transactionId,
                amount: orderData.amount,
            });

            return paymentData;
        } catch (error) {
            logger.error("Error creating VNPAY payment simulation", {
                error: error.message,
                orderData,
            });
            throw error;
        }
    }

    /**
     * Create MOMO payment simulation
     * @param {Object} orderData - Order information
     * @returns {Object} Payment data with QR code
     */
    static async createMoMoPayment(orderData) {
        try {
            const transactionId = this.generateTransactionId("MOMO");
            const expiresAt = new Date(Date.now() + this.CONFIG.MOMO.expirationMinutes * 60 * 1000);

            // Generate fake QR code (base64 image)
            const qrCodeData = this.generateMoMoQRCode(orderData, transactionId);

            // Simulate MOMO deep link
            const deepLink = `momo://app/qr/pay?` +
                `orderId=${orderData.orderId}` +
                `&amount=${Math.round(orderData.amount * 25000)}` + // Convert USD to VND
                `&transactionId=${transactionId}`;

            const paymentData = {
                method: "MOMO",
                transactionId,
                gatewayUrl: this.CONFIG.MOMO.baseUrl,
                qrCode: qrCodeData,
                deepLink,
                accountInfo: null,
                expiresAt,
                simulationDelay: this.CONFIG.MOMO.redirectDelay,
                instructions: [
                    "Open MoMo app and scan the QR code",
                    "Or click the button to open MoMo app",
                    "The payment will be automatically confirmed after a few seconds",
                    "This is a simulation for development/demo purposes"
                ],
            };

            logger.info("MOMO payment simulation created", {
                orderId: orderData.orderId,
                transactionId,
                amount: orderData.amount,
            });

            return paymentData;
        } catch (error) {
            logger.error("Error creating MOMO payment simulation", {
                error: error.message,
                orderData,
            });
            throw error;
        }
    }

    /**
     * Create Bank Transfer payment simulation
     * @param {Object} orderData - Order information
     * @returns {Object} Payment data with bank account info
     */
    static async createBankTransferPayment(orderData) {
        try {
            const transactionId = this.generateTransactionId("BANK");
            const expiresAt = new Date(Date.now() + this.CONFIG.BANK_TRANSFER.expirationHours * 60 * 60 * 1000);

            // Generate transfer content with order ID
            const transferContent = `DH${orderData.orderId.toString().slice(-8)} ${orderData.customerName || ""}`.trim();

            const accountInfo = {
                bankName: this.CONFIG.BANK_TRANSFER.bankName,
                accountNumber: this.CONFIG.BANK_TRANSFER.accountNumber,
                accountName: this.CONFIG.BANK_TRANSFER.accountName,
                transferContent,
                amount: Math.round(orderData.amount * 25000), // Convert USD to VND
                amountFormatted: new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                }).format(Math.round(orderData.amount * 25000)),
            };

            const paymentData = {
                method: "BANK_TRANSFER",
                transactionId,
                gatewayUrl: null,
                qrCode: null,
                accountInfo,
                expiresAt,
                simulationDelay: null, // Manual confirmation required
                instructions: [
                    "Transfer the exact amount to the bank account below",
                    "Use the provided transfer content for faster processing",
                    "Your order will be confirmed after we receive the payment",
                    "This usually takes 1-2 hours during business hours",
                    "For simulation: Admin can manually confirm this payment"
                ],
            };

            logger.info("Bank transfer payment simulation created", {
                orderId: orderData.orderId,
                transactionId,
                amount: orderData.amount,
            });

            return paymentData;
        } catch (error) {
            logger.error("Error creating bank transfer payment simulation", {
                error: error.message,
                orderData,
            });
            throw error;
        }
    }

    /**
     * Generate fake MoMo QR code (SVG as base64)
     * @param {Object} orderData - Order information
     * @param {String} transactionId - Transaction ID
     * @returns {String} Base64 encoded QR code image
     */
    static generateMoMoQRCode(orderData, transactionId) {
        // Create simple SVG QR code placeholder
        const qrContent = `MOMO:${transactionId}:${orderData.amount}`;
        const svgQR = `
            <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
                <rect width="200" height="200" fill="white"/>
                <rect x="20" y="20" width="160" height="160" fill="black"/>
                <rect x="30" y="30" width="140" height="140" fill="white"/>
                <text x="100" y="100" text-anchor="middle" font-size="12" fill="black">
                    MoMo QR
                </text>
                <text x="100" y="120" text-anchor="middle" font-size="10" fill="gray">
                    ${transactionId.slice(-8)}
                </text>
            </svg>
        `;

        // Convert to base64
        return `data:image/svg+xml;base64,${Buffer.from(svgQR).toString("base64")}`;
    }

    /**
     * Confirm payment simulation
     * Auto-confirms payment after delay (for VNPAY, MOMO)
     * @param {String} orderId - Order ID
     * @param {String} method - Payment method
     * @param {String} transactionId - Transaction ID
     * @returns {Object} Confirmation result
     */
    static async confirmPayment(orderId, method, transactionId) {
        try {
            const confirmation = {
                orderId,
                method,
                transactionId,
                status: "SUCCESS",
                paidAt: new Date(),
                message: `Payment confirmed successfully via ${method}`,
            };

            logger.info("Payment simulation confirmed", confirmation);

            return confirmation;
        } catch (error) {
            logger.error("Error confirming payment simulation", {
                error: error.message,
                orderId,
                method,
            });
            throw error;
        }
    }

    /**
     * Simulate payment failure
     * @param {String} orderId - Order ID
     * @param {String} method - Payment method
     * @param {String} reason - Failure reason
     * @returns {Object} Failure result
     */
    static async failPayment(orderId, method, reason = "Simulation cancelled") {
        try {
            const failure = {
                orderId,
                method,
                status: "FAILED",
                reason,
                failedAt: new Date(),
            };

            logger.warn("Payment simulation failed", failure);

            return failure;
        } catch (error) {
            logger.error("Error failing payment simulation", {
                error: error.message,
                orderId,
                method,
            });
            throw error;
        }
    }

    /**
     * Check if payment has expired
     * @param {Date} expiresAt - Expiration date
     * @returns {Boolean} True if expired
     */
    static isPaymentExpired(expiresAt) {
        return new Date() > new Date(expiresAt);
    }

    /**
     * Get payment status
     * @param {String} transactionId - Transaction ID
     * @returns {Object} Payment status (simulated)
     */
    static async getPaymentStatus(transactionId) {
        // In real implementation, query payment gateway
        // For simulation, return success status
        return {
            transactionId,
            status: "PENDING",
            message: "Payment is being processed",
        };
    }
}

module.exports = PaymentSimulationService;
