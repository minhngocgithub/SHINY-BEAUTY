const express = require('express')
const router = express.Router()
const otpController = require('../controller/otpController')
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware')
const { otpLimiter } = require('../config/rateLimiter')

// Route gửi OTP (with rate limiting)
router.post('/send-otp', otpLimiter, otpController.sendOTP);

// Route xác minh OTP (with rate limiting)
router.post('/verify-otp', otpLimiter, otpController.verifyOTP);

// Route gửi lại OTP (with rate limiting)
router.post('/resend-otp', otpLimiter, otpController.resendOTP);

module.exports = router;