const rateLimit = require("express-rate-limit")
// const { RedisStore } = require("rate-limit-redis")
// const { redisClient } = require("./redis")

// Import ipKeyGenerator helper for IPv6 support
const { ipKeyGenerator } = require("express-rate-limit")

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_API_MAX || 100,
    message: {
        error: "Too many requests, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.user?.role === "admin",
    keyGenerator: (req, res) => {
        if (req.user?.id) {
            return `user:${req.user.id}`
        }
        return ipKeyGenerator(req, res)
    },
})

const authLimiter = rateLimit({
    // store: in-memory (default)
    windowMs: 15 * 60 * 1000,
    max: process.env.RATE_LIMIT_AUTH_MAX || 20, // Tăng từ 5 lên 20 cho development
    message: {
        error: "Too many authentication attempts, please try again later.",
    },
    skipSuccessfulRequests: true,
    keyGenerator: (req, res) => {
        const email = req.body?.email || req.query?.email
        if (email) {
            return `email:${email}`
        }
        return ipKeyGenerator(req, res)
    },
})

// Rate limiter for OTP requests
const otpLimiter = rateLimit({
    // store: in-memory (default)
    windowMs: 60 * 60 * 1000, // 1 hour
    max: process.env.RATE_LIMIT_OTP_MAX || 3,
    message: {
        error: "Too many OTP requests, please try again later.",
    },
    keyGenerator: (req, res) => {
        const email = req.body?.email || req.query?.email
        const phone = req.body?.phone || req.query?.phone

        if (email) return `email:${email}`
        if (phone) return `phone:${phone}`
        return ipKeyGenerator(req, res)
    },
})

// Payment rate limiter
const paymentLimiter = rateLimit({
    // store: in-memory (default)
    windowMs: 60 * 60 * 1000, // 1 hour
    max: process.env.RATE_LIMIT_PAYMENT_MAX || 10,
    message: {
        error: "Too many payment attempts, please try again later.",
    },
    keyGenerator: (req, res) => {
        if (req.user?.id) {
            return `user:${req.user.id}`
        }
        return ipKeyGenerator(req, res)
    },
})

// Cart rate limiter
const cartLimiter = rateLimit({
    // store: in-memory (default)
    windowMs: 60 * 1000, // 1 minute
    max: process.env.RATE_LIMIT_CART_MAX || 30,
    message: {
        error: "Too many cart operations, please slow down.",
    },
    keyGenerator: (req, res) => {
        if (req.user?.id) {
            return `user:${req.user.id}`
        }
        return ipKeyGenerator(req, res)
    },
})

module.exports = {
    apiLimiter,
    authLimiter,
    otpLimiter,
    paymentLimiter,
    cartLimiter,
}